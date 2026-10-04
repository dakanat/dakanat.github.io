import {
  placeBirds,
  placeBenches,
  placeCampfires,
  placeChest,
  placeCats,
  placeFireflies,
  placeGrass,
  updateBirds,
  updateCats,
  updateGrass,
  type Bench,
  type Bird,
  type Chest,
  type Campfire,
  type Cat,
  type Firefly,
  type Tuft,
} from "./decor";
import { rasterize, type CharBox } from "./dom";
import { buildNav, nearestNode, nearestOnSeg, segAt, type Nav } from "./nav";
import { placeProps, placeStars, type Prop, type Star } from "./props";
import {
  drawConfetti,
  drawReveal,
  makeConfetti,
  setColorField,
  type Confetti,
  drawBenches,
  drawBirds,
  drawChest,
  drawCampfires,
  drawCats,
  drawFireflies,
  drawFireGlow,
  drawFlag,
  drawGrass,
  drawProps,
  drawStars,
  drawWalker,
} from "./render";
import { chestSpot, createWalker, respawn, setGoal, settle, standStill, update, type Env, type Walker } from "./walker";
import { FH, HARD, S, TEXT, cell, fillRect, seeded, type World } from "./world";

/** Stars to collect before the chest unlocks. */
export const STAR_COUNT = 5;

/**
 * Cleans up progress carried over from storage: the star count is clamped, and the chest
 * only counts as opened if every star was found (so raising STAR_COUNT later relocks it).
 */
export function normalizeProgress(p: { taken: number; opened: boolean } | null | undefined) {
  const taken = Math.min(STAR_COUNT, Math.max(0, Number(p?.taken) || 0));
  return { taken, opened: !!p?.opened && taken >= STAR_COUNT };
}

export interface EngineOptions {
  /** called whenever a star is picked up */
  onStars?: (taken: number, total: number) => void;
  /** called once, when the walker opens the chest */
  onChestOpened?: () => void;
  /** progress carried over from earlier (e.g. before switching language): stars found, chest opened */
  initial?: { taken: number; opened: boolean };
}

/**
 * Runs the stick figure over a page. Coordinates are relative to `root`, which should
 * span the full page width; both canvases are fixed to the viewport and translated
 * by the scroll position every frame, so they stay small however long the page is.
 */
export class WalkerEngine {
  private world: World | null = null;
  private nav: Nav | null = null;
  private props: Prop[] = [];
  private stars: Star[] = [];
  private birds: Bird[] = [];
  private cats: Cat[] = [];
  private fireflies: Firefly[] = [];
  private grass: Tuft[] = [];
  private fires: Campfire[] = [];
  private benches: Bench[] = [];
  private chest: Chest | null = null;
  private me: Walker = createWalker();
  private rand = seeded(1);
  private raf = 0;
  private last = 0;
  private taken = 0;
  private opened = false;
  /** when the chest was opened (s), so the colour wave can spread out from it */
  private openedAt = -Infinity;
  private confetti: Confetti[] = [];
  /** characters bucketed by row (32px), to find the one under the walker's feet */
  private charRows = new Map<number, CharBox[]>();
  /** the character currently pressed down, wrapped in a span */
  private pressed: { box: CharBox; span: HTMLSpanElement; after: Text; full: string } | null = null;
  private total = 0;
  private rebuildTimer = 0;
  private lastSize = "";
  private readonly reduceMotion: boolean;
  private readonly observer: ResizeObserver;
  resting = false;

  constructor(
    private root: HTMLElement,
    private bg: HTMLCanvasElement,
    private fg: HTMLCanvasElement,
    private opts: EngineOptions = {},
  ) {
    this.reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (opts.initial) {
      const { taken, opened } = normalizeProgress(opts.initial);
      this.total = STAR_COUNT;
      this.taken = taken;
      // already opened earlier: the page is simply in colour, without replaying the reveal
      this.opened = opened;
    }
    this.observer = new ResizeObserver(() => this.scheduleBuild());
    this.observer.observe(root);
    window.addEventListener("resize", this.sizeCanvases);
    this.sizeCanvases();
    this.build();
    document.fonts?.ready.then(() => this.build());
  }

  private scheduleBuild() {
    const size = `${this.root.clientWidth}x${this.root.scrollHeight}`;
    if (size === this.lastSize) return;
    window.clearTimeout(this.rebuildTimer);
    this.rebuildTimer = window.setTimeout(() => this.build(), 200);
  }

  private sizeCanvases = () => {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    for (const c of [this.bg, this.fg]) {
      c.width = Math.round(window.innerWidth * d);
      c.height = Math.round(window.innerHeight * d);
    }
  };

  build() {
    this.lastSize = `${this.root.clientWidth}x${this.root.scrollHeight}`;
    this.release();
    const { world, rules, floorY, chars } = rasterize(this.root);
    this.charRows = new Map();
    for (const c of chars) {
      for (let r = Math.floor(c.top / 32); r <= Math.floor(c.bottom / 32); r++) {
        if (!this.charRows.has(r)) this.charRows.set(r, []);
        this.charRows.get(r)!.push(c);
      }
    }
    if (!this.total) this.total = STAR_COUNT; // before the chest below reads it
    const rand = seeded(world.W * 31 + Math.round(world.H / 50));
    const { props, specials, perches } = placeProps(world, rules, floorY, rand);
    const nav = buildNav(world, specials);
    // Decor is placed against a copy of the map in which every prop (ladders included) and
    // every piece of decor already placed is marked as taken, so no two objects overlap.
    const occ: World = { ...world, mask: world.mask.slice() };
    const reserve = (x: number, y: number, w: number, h: number) => fillRect(occ, x, y, w, h, HARD);
    for (const p of props) reserve(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
    const reserveSpots = (list: { x: number; y: number }[], w: number, h: number) => {
      for (const p of list) reserve(p.x - w / 2, p.y - h, w, h);
    };
    this.fires = placeCampfires(occ, nav, rand, Math.max(1, Math.round(world.H / 1500)));
    reserveSpots(this.fires, 76, 30);
    this.chest = placeChest(occ, nav, rand);
    if (this.chest) Object.assign(this.chest, { unlocked: this.taken >= this.total, open: this.opened });
    if (this.chest) reserveSpots([this.chest], 36, 24);
    this.benches = placeBenches(occ, nav, rand, Math.max(1, Math.round(world.H / 1200)));
    reserveSpots(this.benches, 34, 18);
    this.cats = placeCats(occ, nav, rand, Math.max(1, Math.round(world.H / 1600)));
    reserveSpots(this.cats, 30, 20);
    this.birds = placeBirds(occ, nav, rand, Math.max(6, Math.round(world.H / 250)));
    reserveSpots(this.birds.map((b) => ({ x: b.homeX, y: b.homeY })), 18, 14);
    this.stars = placeStars(occ, nav, this.total - this.taken, rand, 110, perches);
    reserveSpots(this.stars.map((st) => ({ x: st.x, y: st.y + 8 })), 18, 16);
    this.grass = placeGrass(occ, [...rules, { x1: 0, x2: world.W, y: floorY }], rand);
    reserveSpots(this.grass.map((t) => ({ x: t.x + 3, y: t.y })), 14, 16);
    this.fireflies = placeFireflies(occ, rand, Math.max(2, Math.round(world.H / 1200)));
    this.world = world;
    this.nav = nav;
    this.props = props;
    this.rand = rand;
    const first = !this.me.y;
    this.me.path = null;
    this.me.goal = null;
    // a narrower page can leave the walker outside it: drop it back in rather than leave it stranded
    const outside = this.me.x < 4 || this.me.x > world.W - 4 || this.me.y > world.H;
    if (first || outside) respawn(this.me, this.env());
    else settle(this.me, world);
    if (this.reduceMotion) standStill(this.me, this.env());
    this.opts.onStars?.(this.taken, this.total);
  }

  private env(): Env {
    const top = -this.root.getBoundingClientRect().top;
    return {
      world: this.world!,
      nav: this.nav!,
      props: this.props,
      stars: this.stars,
      fires: this.fires,
      chest: this.chest,
      cats: this.cats,
      birds: this.birds,
      benches: this.benches,
      view: { top, bottom: top + window.innerHeight },
      resting: this.resting,
      rand: this.rand,
    };
  }

  /** Points the walker at the spot under a tap (viewport coordinates). */
  tap(clientX: number, clientY: number) {
    if (!this.world || !this.nav) return;
    const rr = this.root.getBoundingClientRect();
    const x = clientX - rr.left;
    const y = clientY - rr.top;
    if (this.chest && Math.hypot(this.chest.x - x, this.chest.y - 8 - y) < 24) {
      const n = chestSpot(this.env(), this.chest);
      if (n) {
        setGoal(this.me, this.env(), n, true);
        this.me.toChest = true;
        return;
      }
    }
    const near = this.stars.find((s) => !s.taken && Math.hypot(s.x - x, s.y - y) < 24);
    if (near) {
      const n = nearestNode(this.nav, near.x, near.y + 10, 30);
      if (n) return setGoal(this.me, this.env(), n, true);
    }
    for (let yy = Math.max(0, y - 10); yy < Math.min(this.world.H, y + 600); yy += S) {
      const s = segAt(this.world, this.nav, x, yy);
      if (s < 0) continue;
      const n = nearestOnSeg(this.nav, s, x);
      if (n) return setGoal(this.me, this.env(), n, true);
    }
  }

  start() {
    const loop = (t: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (t - this.last) / 1000 || 0);
      this.last = t;
      if (document.hidden || !this.world) return;
      const env = this.env();
      if (!this.reduceMotion) {
        update(this.me, env, dt);
        updateBirds(this.birds, this.me, dt, this.rand);
        updateCats(this.cats, this.world!, this.me, dt, this.rand);
        updateGrass(this.grass, this.me, dt);
      }
      this.collect();
      this.press();
      if (this.chest?.open && !this.opened) {
        this.opened = true;
        this.openedAt = t / 1000;
        if (this.chest) this.confetti = makeConfetti(this.chest.x, this.chest.y, this.rand);
        this.opts.onChestOpened?.();
      }
      this.draw(env, t / 1000);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private collect() {
    const me = this.me;
    for (const s of this.stars) {
      if (s.taken || Math.abs(s.x - me.x) > 9 || Math.abs(me.y - FH / 2 - s.y) > 12) continue;
      s.taken = true;
      this.taken++;
      me.bubble = "★";
      me.bubbleT = 0.8;
      this.opts.onStars?.(this.taken, this.total);
    }
    if (this.chest && this.taken >= this.total) this.chest.unlocked = true;
  }

  private draw(env: Env, t: number) {
    // colour spreads from the opened chest at 600px/s with a soft 200px edge
    const chest = this.chest;
    const since = t - this.openedAt;
    if (!this.opened || !chest) setColorField(() => 0);
    else if (since > 10 || this.reduceMotion) setColorField(() => 1);
    else setColorField((x, y) => Math.max(0, Math.min(1, (since * 600 - Math.hypot(x - chest.x, y - chest.y)) / 200)));
    const rr = this.root.getBoundingClientRect();
    const d = this.fg.width / window.innerWidth;
    const { top, bottom } = env.view;
    const b = this.bg.getContext("2d")!;
    b.setTransform(d, 0, 0, d, rr.left * d, rr.top * d);
    b.clearRect(-rr.left, top, window.innerWidth, window.innerHeight);
    const tt = this.reduceMotion ? 0 : t;
    if (this.opened && chest) drawReveal(b, chest.x, chest.y, this.reduceMotion ? 99 : since, top, bottom, -rr.left, window.innerWidth);
    drawFireflies(b, this.fireflies, tt, top, bottom);
    drawFireGlow(b, this.fires, tt, top, bottom);
    drawBenches(b, this.benches, top, bottom);
    drawProps(b, this.props, top, bottom);
    const f = this.fg.getContext("2d")!;
    f.setTransform(d, 0, 0, d, rr.left * d, rr.top * d);
    f.clearRect(-rr.left, top, window.innerWidth, window.innerHeight);
    drawStars(f, this.stars, t, top, bottom);
    drawBirds(f, this.birds, t, top, bottom);
    drawCats(f, this.cats, tt, top, bottom);
    drawCampfires(f, this.fires, tt, top, bottom);
    drawChest(f, this.chest, tt, top, bottom);
    drawFlag(f, this.me);
    // sink with the character being stood on
    f.save();
    if (this.pressed) f.translate(0, 2);
    drawWalker(f, this.me, this.world!, t);
    f.restore();
    if (!this.reduceMotion) drawConfetti(f, this.confetti, since);
    drawGrass(f, this.grass, tt, top, bottom);
  }

  /**
   * The character the walker stands on sinks a little and turns star-coloured. Its text node is
   * cut in three (before / the character in a relatively positioned span / after), which moves it
   * without reflowing the line. Releasing puts the original text back into the original node,
   * so nothing else holding that node (React included) ever sees a different one.
   */
  private press() {
    const me = this.me;
    let box: CharBox | undefined;
    if (me.ground && this.world && cell(this.world, me.x, me.y) === TEXT) {
      box = this.charRows.get(Math.floor(me.y / 32))?.find((c) => me.x >= c.x1 - 1 && me.x <= c.x2 + 1 && me.y >= c.top - 2 && me.y <= c.bottom);
    }
    if (box === this.pressed?.box) return;
    this.release();
    const sel = window.getSelection();
    if (!box || (sel && !sel.isCollapsed) || !box.node.isConnected) return;
    const node = box.node;
    const full = node.data;
    const span = document.createElement("span");
    span.style.cssText = "position:relative;top:2px;color:rgb(232,212,138)";
    span.textContent = full.slice(box.offset, box.offset + box.length);
    const after = document.createTextNode(full.slice(box.offset + box.length));
    node.data = full.slice(0, box.offset);
    node.after(span, after);
    this.pressed = { box, span, after, full };
  }

  private release() {
    const p = this.pressed;
    this.pressed = null;
    if (!p) return;
    p.span.remove();
    p.after.remove();
    p.box.node.data = p.full;
  }

  destroy() {
    this.release();
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.rebuildTimer);
    this.observer.disconnect();
    window.removeEventListener("resize", this.sizeCanvases);
  }
}
