import type { Nav } from "./nav";
import { TEXT, cell, isEmptyRect, type World } from "./world";

/** Small birds perched on surfaces. They fly off when the walker gets close and come back later. */
export interface Bird {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  flying: boolean;
  /** seconds until the next hop while perched, or until it returns while away */
  t: number;
  face: number;
}

/**
 * A cat that strolls along rules and blocks, sitting down now and then. It turns to watch
 * the walker, and shows a heart when the walker stops beside it.
 */
export interface Cat {
  x: number;
  y: number;
  face: number;
  heart: number;
  walking: boolean;
  /** seconds until it switches between strolling and sitting */
  t: number;
  step: number;
}

/** Fireflies drifting around a point in empty space, blinking. */
export interface Firefly {
  cx: number;
  cy: number;
  phase: number;
  speed: number;
}

/** Whether (x, y) is on a rule, block or the floor rather than on a glyph. */
const offText = (w: World, x: number, y: number) => cell(w, x, y) > 0 && cell(w, x, y) !== TEXT;

/** Spots on rules, blocks or the floor (never on text) with room for something `width`×`height` above, spaced `gap` apart. */
function spots(w: World, nav: Nav, rand: () => number, count: number, width: number, height: number, gap: number, taken: { x: number; y: number }[]) {
  const out: { x: number; y: number }[] = [];
  const order = nav.nodes.map((n) => ({ n, k: rand() })).sort((a, b) => a.k - b.k);
  for (const { n } of order) {
    if (out.length >= count) break;
    if (!offText(w, n.x - width / 2, n.y) || !offText(w, n.x, n.y) || !offText(w, n.x + width / 2, n.y)) continue;
    if (!isEmptyRect(w, n.x - width / 2, n.y - height - 1, width, height)) continue;
    if ([...out, ...taken].some((p) => Math.hypot(p.x - n.x, p.y - n.y) < gap)) continue;
    out.push({ x: n.x, y: n.y });
  }
  return out;
}

export function placeBirds(w: World, nav: Nav, rand: () => number, count: number, taken: { x: number; y: number }[] = []): Bird[] {
  return spots(w, nav, rand, count, 12, 9, 120, taken).map((p) => ({
    homeX: p.x, homeY: p.y, x: p.x, y: p.y, vx: 0, vy: 0, flying: false, t: 1 + rand() * 3, face: rand() < 0.5 ? -1 : 1,
  }));
}

export function placeCats(w: World, nav: Nav, rand: () => number, count: number, taken: { x: number; y: number }[] = []): Cat[] {
  return spots(w, nav, rand, count, 20, 12, 400, taken).map((p) => ({
    x: p.x, y: p.y, face: rand() < 0.5 ? -1 : 1, heart: 0, walking: false, t: 1 + rand() * 4, step: 0,
  }));
}

export function placeFireflies(w: World, rand: () => number, swarms: number): Firefly[] {
  const flies: Firefly[] = [];
  for (let tries = 0, n = 0; tries < swarms * 80 && n < swarms; tries++) {
    const cx = 30 + rand() * (w.W - 60);
    const cy = 80 + rand() * (w.H - 200);
    if (!isEmptyRect(w, cx - 40, cy - 30, 80, 60)) continue;
    if (flies.some((f) => Math.hypot(f.cx - cx, f.cy - cy) < 300)) continue;
    n++;
    const k = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < k; i++) flies.push({ cx, cy, phase: rand() * 100, speed: 0.4 + rand() * 0.5 });
  }
  return flies;
}

/** Firefly position at time t: a slow loop around its swarm centre. */
export function fireflyAt(f: Firefly, t: number): [number, number] {
  const a = t * f.speed + f.phase;
  return [f.cx + Math.sin(a) * 28 + Math.sin(a * 2.3) * 8, f.cy + Math.cos(a * 0.8) * 18 + Math.sin(a * 3.1) * 5];
}

type Walker = { x: number; y: number; ground: boolean; mode: string };

export function updateBirds(birds: Bird[], walker: Walker, dt: number, rand: () => number) {
  for (const b of birds) {
    b.t -= dt;
    if (b.flying) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy = Math.max(-140, b.vy - 30 * dt);
      if (b.t <= 0) {
        // come back once the walker has moved on
        if (Math.hypot(walker.x - b.homeX, walker.y - b.homeY) > 120) Object.assign(b, { x: b.homeX, y: b.homeY, flying: false, t: 2 + rand() * 3 });
        else b.t = 2;
      }
      continue;
    }
    if (Math.hypot(walker.x - b.x, walker.y - b.y) < 46) {
      b.flying = true;
      b.face = walker.x < b.x ? 1 : -1;
      b.vx = b.face * (90 + rand() * 60);
      b.vy = -110;
      b.t = 6 + rand() * 4;
    } else if (b.t <= 0) {
      b.face = rand() < 0.5 ? -1 : 1;
      b.t = 1.5 + rand() * 3;
    }
  }
}

export function updateCats(cats: Cat[], w: World, walker: Walker, dt: number, rand: () => number) {
  for (const c of cats) {
    const d = Math.hypot(walker.x - c.x, walker.y - c.y);
    const resting = walker.ground && walker.mode === "idle";
    if (d < 30 && resting && c.heart <= 0) {
      c.heart = 1.6;
      c.walking = false; // stops to be petted
      c.t = 3;
    }
    c.heart = Math.max(0, c.heart - dt);
    c.t -= dt;
    if (c.t <= 0) {
      c.walking = !c.walking;
      c.t = c.walking ? 2 + rand() * 5 : 2 + rand() * 4;
      if (c.walking && rand() < 0.5) c.face *= -1;
    }
    if (!c.walking) {
      if (d < 120) c.face = walker.x < c.x ? -1 : 1; // watches the walker while sitting
      continue;
    }
    // stroll along the rule or block it is on; turn back at its end or at anything in the way
    const nx = c.x + c.face * 14 * dt;
    const ahead = nx + c.face * 10;
    if (!offText(w, ahead, c.y) || !isEmptyRect(w, ahead - 2, c.y - 12, 4, 11)) c.face *= -1;
    else {
      c.x = nx;
      c.step += dt * 6;
    }
  }
}

/** A tuft of grass, sometimes with a flower, growing on a rule or the floor. It bends when the walker brushes past. */
export interface Tuft {
  x: number;
  y: number;
  blades: { h: number; flower: boolean }[];
  bend: number;
}

/** A campfire on a surface. The walker likes to sit next to it for a while. */
export interface Campfire {
  x: number;
  y: number;
  seed: number;
}


export function placeGrass(w: World, rules: { x1: number; x2: number; y: number }[], rand: () => number): Tuft[] {
  const tufts: Tuft[] = [];
  for (const r of rules) {
    for (let x = r.x1 + 6 + rand() * 30; x < r.x2 - 8; x += 26 + rand() * 70) {
      if (!isEmptyRect(w, x - 4, r.y - 14, 10, 13)) continue;
      const n = 2 + Math.floor(rand() * 3);
      const blades = Array.from({ length: n }, () => ({
        h: 2 + Math.floor(rand() * 3),
        flower: rand() < 0.12,
      }));
      tufts.push({ x, y: r.y, blades, bend: 0 });
    }
  }
  return tufts;
}

export function placeCampfires(w: World, nav: Nav, rand: () => number, count: number, taken: { x: number; y: number }[] = []): Campfire[] {
  // needs room for the fire plus a spot on either side for the walker to sit
  return spots(w, nav, rand, count, 70, 26, 700, taken).map((p) => ({ x: p.x, y: p.y, seed: rand() * 100 }));
}

export function updateGrass(tufts: Tuft[], walker: { x: number; y: number }, dt: number) {
  for (const t of tufts) {
    if (Math.abs(walker.x - t.x - 3) < 8 && Math.abs(walker.y - t.y) < 4) t.bend = walker.x < t.x ? 1 : -1;
    t.bend *= Math.max(0, 1 - dt * 2.5);
  }
}

/** A bench to sit on for a while. */
export interface Bench {
  x: number;
  y: number;
}

/**
 * A treasure chest at the bottom of the page. Collecting every star unlocks it; the walker
 * then goes to open it, and opening it is what brings up the thank-you note.
 */
export interface Chest {
  x: number;
  y: number;
  unlocked: boolean;
  open: boolean;
}

export function placeBenches(w: World, nav: Nav, rand: () => number, count: number, taken: { x: number; y: number }[] = []): Bench[] {
  return spots(w, nav, rand, count, 30, 14, 500, taken);
}

/** The chest sits on the lowest surface with room for it, so it reads as the end of the page. */
export function placeChest(w: World, nav: Nav, rand: () => number, taken: { x: number; y: number }[] = []): Chest | null {
  const floor = Math.max(...nav.nodes.map((n) => n.y));
  const low = nav.nodes.filter(
    (n) => n.y === floor && n.x > 40 && n.x < w.W - 40 && isEmptyRect(w, n.x - 14, n.y - 18, 28, 17) && taken.every((p) => Math.hypot(p.x - n.x, p.y - n.y) > 60),
  );
  const n = low[Math.floor(rand() * low.length)];
  return n ? { x: n.x, y: n.y, unlocked: false, open: false } : null;
}
