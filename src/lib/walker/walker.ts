import {
  SPRING_V,
  ballistic,
  findPath,
  nearestNode,
  nearestOnSeg,
  segAt,
  type Link,
  type Nav,
  type NavNode,
} from "./nav";
import type { Bird, Cat, Chest } from "./decor";
import type { Prop, Star } from "./props";
import { FH, G, ONEWAY, S, STEP, anyAt, bodyFree, cell, groundAt, hard, topAt, type World } from "./world";

export type Mode = "walk" | "run" | "idle" | "hop" | "jump" | "sit";

export interface Walker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ground: boolean;
  face: number;
  mode: Mode;
  timer: number;
  phase: number;
  acc: number;
  path: Link[] | null;
  pi: number;
  goal: NavNode | null;
  plans: number;
  partial: boolean;
  bubble: string;
  bubbleT: number;
  wait: number;
  climb: { x: number; toY: number; exitX: number } | null;
  pipe: { t: number; from: [number, number]; to: [number, number] } | null;
  sink: number;
  sinkY: number;
  jumping: Link | null;
  flag: { x: number; y: number; t: number; fail: boolean } | null;
  offscreen: number;
  /** campfire or bench the walker is heading to, to sit for a while */
  restAt: { x: number; y: number; kind: "fire" | "bench" } | null;
  /** height of what the walker is sitting on (a bench seat), 0 on the ground */
  seat: number;
  /** heading somewhere the visitor clicked: moves at full speed */
  hurry: boolean;
  /** while dropping through a rule: the rule's y, which is not landed on */
  dropFrom: number | null;
  /** the star the walker is going after on its own */
  chasing: Star | null;
  /**
   * A planned jump in progress. It follows its parabola through anything in the way
   * and lands exactly on the target, so planned routes never fail.
   */
  flight: { x0: number; y0: number; vx: number; vy: number; t: number; T: number } | null;
  /** heading to the chest to open it */
  toChest: boolean;
  /** heading to a pipe top to go down it */
  usePipe: boolean;
  /** heading to a cat, to stand beside it for a moment */
  visit: boolean;
  lastActivity: string;
}

export interface Env {
  world: World;
  nav: Nav;
  props: Prop[];
  stars: Star[];
  fires: { x: number; y: number }[];
  chest: Chest | null;
  cats: Cat[];
  birds: Bird[];
  benches: { x: number; y: number }[];
  /** visible part of the page, in page coordinates */
  view: { top: number; bottom: number };
  resting: boolean;
  rand: () => number;
}

export function createWalker(): Walker {
  return {
    x: 40, y: 0, vx: 0, vy: 0, ground: false, face: 1, mode: "walk", timer: 1, phase: 0, acc: 0,
    path: null, pi: 0, goal: null, plans: 0, partial: false, bubble: "", bubbleT: 0, wait: 0,
    climb: null, pipe: null, sink: 0, sinkY: 0, jumping: null, flag: null, offscreen: 0, restAt: null, seat: 0, hurry: false, dropFrom: null, chasing: null, flight: null, toChest: false, usePipe: false, visit: false, lastActivity: "",
  };
}

const rnd = (env: Env, a: number, b: number) => a + env.rand() * (b - a);

/** Walking and running speeds (px/s): brisk when the visitor sent the walker somewhere, leisurely otherwise. */
const speed = (me: Walker, run: boolean) => (me.hurry ? (run ? 140 : 70) : run ? 72 : 34);

function say(me: Walker, text: string, secs = 0.9) {
  me.bubble = text;
  me.bubbleT = secs;
}

/** Drops the walker in from the top of the visible area. */
export function respawn(me: Walker, env: Env) {
  const { top, bottom } = env.view;
  const cands = env.nav.nodes.filter((n) => n.y > top + 40 && n.y < top + (bottom - top) * 0.6);
  const n = cands[Math.floor(env.rand() * cands.length)] ?? env.nav.nodes[0];
  if (!n) return;
  Object.assign(me, { x: n.x, y: Math.max(top - 20, n.y - 160), vx: 0, vy: 0, ground: false });
  me.path = null;
  me.climb = null;
  me.pipe = null;
  me.jumping = null;
  me.offscreen = 0;
}

/** With reduced motion nothing moves: put the walker on its feet on a surface in view. */
export function standStill(me: Walker, env: Env) {
  const { top, bottom } = env.view;
  const n = env.nav.nodes.find((m) => m.y > top + 60 && m.y < bottom - 60) ?? env.nav.nodes[0];
  if (!n) return;
  Object.assign(me, { x: n.x, y: n.y, vx: 0, vy: 0, ground: true, mode: "idle" });
  me.flight = null;
  me.jumping = null;
}

/** After a relayout, nudges the walker out of anything that now overlaps it. */
export function settle(me: Walker, w: World) {
  for (let k = 0; k < 40 && (hard(w, me.x, me.y - S) || !bodyFree(w, me.x, me.y)); k++) me.y -= S;
  if (me.ground && !groundAt(w, me.x, me.y)) me.ground = false;
}

function tryMove(w: World, me: Walker, nx: number): number | "fall" | null {
  const y = me.y;
  if (bodyFree(w, nx, y)) {
    if (groundAt(w, nx, y)) return y;
    for (let d = S; d <= STEP; d += S) if (groundAt(w, nx, y + d) && bodyFree(w, nx, y + d)) return y + d;
    return "fall";
  }
  for (let k = S; k <= STEP; k += S) if (bodyFree(w, nx, y - k) && groundAt(w, nx, y - k)) return y - k;
  return null;
}

function walk(w: World, me: Walker, speed: number, dt: number): "ok" | "wall" | "fall" {
  me.acc += speed * dt;
  me.phase += (speed * dt) / 5;
  while (me.acc >= 1) {
    me.acc -= 1;
    const nx = me.x + me.face;
    const r = tryMove(w, me, nx);
    if (r === null) return "wall";
    if (r === "fall") return "fall";
    me.x = nx;
    me.y = r;
  }
  return "ok";
}

function fly(me: Walker, step: Link, vx: number, vy: number, T: number) {
  me.jumping = step;
  me.mode = "jump";
  me.flight = { x0: me.x, y0: me.y, vx, vy, t: 0, T };
  launch(me, vx, vy);
}

type Activity = { node: NavNode; start: () => void; key: string };

/**
 * Picks something in view to interact with: sit by a fire, lounge on a bench, bounce on a
 * spring, go down a pipe, climb a ladder, visit a cat, or scare a bird off. Avoids repeating
 * the last activity right away.
 */
function playWithSomething(me: Walker, env: Env, inView: (y: number) => boolean): boolean {
  const near = (x: number, y: number) => inView(y) && Math.abs(x - me.x) < 700;
  const go = (node: NavNode | null, key: string, after?: () => void): Activity | null =>
    node ? { node, key, start: () => { setGoal(me, env, node, false); after?.(); } } : null;
  const options: (Activity | null)[] = [];
  for (const f of env.fires) {
    if (!near(f.x, f.y)) continue;
    const side = me.x < f.x ? -1 : 1;
    options.push(go(nearestNode(env.nav, f.x + side * 18, f.y, 14), `fire${f.x}`, () => (me.restAt = { ...f, kind: "fire" })));
  }
  for (const b of env.benches) {
    if (near(b.x, b.y)) options.push(go(nearestNode(env.nav, b.x, b.y, 14), `bench${b.x}`, () => (me.restAt = { ...b, kind: "bench" })));
  }
  for (const p of env.props) {
    if (!near(p.x, p.y)) continue;
    if (p.type === "spring") options.push(go(nearestNode(env.nav, p.x + p.w / 2, p.y, 8), `spring${p.x}`));
    if (p.type === "pipe") {
      // go to the pipe's top; arriving there sends the walker down it
      options.push(go(nearestNode(env.nav, p.x + p.w / 2, p.y, 8), `pipe${p.x}`, () => (me.usePipe = true)));
    }
    if (p.type === "ladder") {
      // to the far end of the ladder, which the route will usually climb
      const below = me.y > p.y + p.h / 2;
      options.push(go(nearestNode(env.nav, p.x + p.w / 2, below ? p.y : p.y + p.h, 8), `ladder${p.x}${p.y}`));
    }
  }
  for (const c of env.cats) {
    if (near(c.x, c.y)) options.push(go(nearestNode(env.nav, c.x + (me.x < c.x ? -14 : 14), c.y, 12), `cat${c.x}`, () => (me.visit = true)));
  }
  for (const b of env.birds) {
    if (!b.flying && near(b.homeX, b.homeY)) options.push(go(nearestNode(env.nav, b.homeX, b.homeY, 12), `bird${b.homeX}`));
  }
  const choices = options.filter((o): o is Activity => !!o && o.key !== me.lastActivity);
  const pick = choices[Math.floor(env.rand() * choices.length)];
  if (!pick) return false;
  me.lastActivity = pick.key;
  pick.start();
  return true;
}

/** The chest sits on the very bottom of the page, so any part of it showing counts. */
const chestVisible = (env: Env, chest: Chest) => chest.y > env.view.top && chest.y - 16 < env.view.bottom;

/** Where to stand to open the chest: just beside it. */
export function chestSpot(env: Env, chest: Chest): NavNode | null {
  let best: NavNode | null = null;
  for (const n of env.nav.nodes) {
    if (Math.abs(n.y - chest.y) > 4) continue;
    const d = Math.abs(Math.abs(n.x - chest.x) - 16);
    if (Math.abs(n.x - chest.x) < 40 && (!best || d < Math.abs(Math.abs(best.x - chest.x) - 16))) best = n;
  }
  return best;
}

/** Steps down through the rule the walker stands on. */
function dropThrough(me: Walker) {
  me.dropFrom = me.y;
  me.ground = false;
  me.vx = 0;
  me.vy = 40;
  me.mode = "jump";
}

function launch(me: Walker, vx: number, vy: number) {
  me.vx = vx;
  me.vy = vy;
  me.ground = false;
  me.face = Math.sign(vx) || me.face;
}

function stepOff(me: Walker, speed: number) {
  me.x += me.face;
  me.ground = false;
  me.vx = me.face * speed;
  me.vy = 0;
}

/** Sends the walker towards a node. A tap gets a "!" and a short pause before it sets off. */
export function setGoal(me: Walker, env: Env, node: NavNode, fromTap: boolean) {
  me.goal = node;
  me.plans = 0;
  me.path = null;
  me.hurry = fromTap;
  if (fromTap) {
    me.chasing = null;
    me.toChest = false;
  }
  me.usePipe = false;
  me.visit = false;
  if (fromTap) {
    me.restAt = null;
    me.flag = { x: node.x, y: node.y, t: 0, fail: false };
    say(me, "!", 0.5);
    me.wait = 0.45;
    me.face = Math.sign(node.x - me.x) || me.face;
  } else plan(me, env);
}

function plan(me: Walker, env: Env) {
  if (!me.goal) return;
  if (++me.plans > 8) return giveUp(me);
  const { world: w, nav } = env;
  const seg = segAt(w, nav, me.x, me.y);
  const onSeg = seg >= 0 ? nearestOnSeg(nav, seg, me.x) : null;
  const start = onSeg ?? nearestNode(nav, me.x, me.y, 80);
  if (!start) return giveUp(me);
  if (onSeg && me.goal.seg === seg) {
    me.path = [{ to: me.goal, type: "walk", cost: 0 }];
    me.partial = false;
  } else {
    const { steps, partial } = findPath(w, nav, start, me.goal);
    me.path = [{ to: start, type: onSeg ? "walk" : "jump", cost: 0 }, ...steps];
    me.partial = partial;
  }
  // stretches of walking along one surface become a single step, so the walker can run them
  me.path = me.path.filter(
    (st, i, arr) => !(st.type === "walk" && arr[i + 1]?.type === "walk" && arr[i + 1].to.seg === st.to.seg),
  );
  me.pi = 0;
}

function giveUp(me: Walker) {
  if (me.chasing) me.chasing.skip = true;
  me.chasing = null;
  me.hurry = false;
  me.path = null;
  me.goal = null;
  say(me, "?", 1.4);
  me.mode = "idle";
  me.timer = 1.4;
  if (me.flag) me.flag.fail = true;
}

function arrive(me: Walker, env: Env) {
  if (me.chasing && me.partial) me.chasing.skip = true;
  if (me.chasing && !me.partial) me.timer = 0.3; // straight on to the next one
  me.chasing = null;
  me.hurry = false;
  me.path = null;
  if (me.flag && me.goal) {
    if (me.partial) {
      say(me, "?", 1.4);
      me.face = Math.sign(me.goal.x - me.x) || me.face;
      me.flag.fail = true;
      me.flag.t = 0;
    } else {
      say(me, "♪", 1);
      launch(me, 0, -170);
      me.flag = null;
    }
  }
  me.goal = null;
  me.timer = rnd(env, 0.6, 1.6);
  const chest = env.chest;
  if (me.toChest && chest && Math.abs(me.x - chest.x) < 26 && Math.abs(me.y - chest.y) < 6) {
    me.face = Math.sign(chest.x - me.x) || 1;
    if (chest.unlocked) {
      chest.open = true;
      say(me, "!", 1.4);
    } else say(me, "…", 1.4); // still locked: not every star has been found
    me.flag = null;
  }
  me.toChest = false;
  // reached a pipe top on purpose: go down it and come out of the linked pipe
  const pipeLink = me.usePipe ? env.nav.nodes.find((n) => Math.hypot(n.x - me.x, n.y - me.y) < 6)?.links.find((l) => l.type === "pipe") : undefined;
  me.usePipe = false;
  if (pipeLink) {
    me.pipe = { t: 0, from: [me.x, me.y], to: [pipeLink.to.x, pipeLink.to.y] };
    me.ground = false;
  }
  // beside a cat: stay a little while so it shows its heart
  if (me.visit) {
    me.visit = false;
    me.mode = "idle";
    me.timer = rnd(env, 2.5, 4);
    const cat = env.cats.find((c) => Math.abs(c.x - me.x) < 30 && Math.abs(c.y - me.y) < 6);
    if (cat) me.face = Math.sign(cat.x - me.x) || me.face;
  }
  const rest = me.restAt;
  me.restAt = null;
  if (rest?.kind === "fire" && Math.abs(me.x - rest.x) < 34 && Math.abs(me.y - rest.y) < 6) {
    me.mode = "sit";
    me.face = Math.sign(rest.x - me.x) || 1;
    me.timer = rnd(env, 4, 8);
  } else if (rest?.kind === "bench" && Math.abs(me.x - rest.x) < 12 && Math.abs(me.y - rest.y) < 6) {
    // stretch out along the bench, head at a random end
    me.mode = "sit";
    me.seat = 6;
    me.x = rest.x;
    me.face = env.rand() < 0.5 ? -1 : 1;
    me.timer = rnd(env, 4, 9);
  }
}

function follow(me: Walker, env: Env, dt: number) {
  const w = env.world;
  const st = me.path![me.pi];
  if (!st) return arrive(me, env);
  if (st.type === "walk") {
    const dx = st.to.x - me.x;
    if (Math.abs(dx) <= 1.5) {
      me.pi++;
      return;
    }
    me.face = Math.sign(dx);
    me.mode = Math.abs(dx) > 40 ? "run" : "walk";
    const r = walk(w, me, speed(me, me.mode === "run"), dt);
    if (r === "fall") stepOff(me, 50);
    else if (r === "wall") launch(me, me.face * 45, -255);
  } else if (st.type === "jump") {
    const arc = ballistic(w, me.x, me.y, st.to.x, st.to.y, false);
    if (!arc) return plan(me, env);
    fly(me, st, arc.vx, arc.vy, arc.t);
  } else if (st.type === "ladder") {
    const lx = st.x ?? me.x;
    if (Math.abs(me.x - lx) > 24) {
      me.face = Math.sign(lx - me.x);
      walk(w, me, speed(me, false), dt);
      return;
    }
    me.climb = { x: lx, toY: st.to.y, exitX: st.to.x };
    me.ground = false;
  } else if (st.type === "drop") {
    // step off and fall straight through the rule onto what is below
    const vy = 40;
    const t = (-vy + Math.sqrt(vy * vy + 2 * G * (st.to.y - me.y))) / G;
    fly(me, st, (st.to.x - me.x) / t, vy, t);
  } else if (st.type === "pipe") {
    me.pipe = { t: 0, from: [me.x, me.y], to: [st.to.x, st.to.y] };
    me.ground = false;
  }
}

function wander(me: Walker, env: Env, dt: number) {
  const w = env.world;
  me.timer -= dt;
  if (env.resting) {
    me.mode = "idle";
    return;
  }
  if (me.timer < 0) {
    me.timer = rnd(env, 1, 2.6);
    me.seat = 0;
    const r = env.rand();
    const inView = (y: number) => y > env.view.top + 20 && y < env.view.bottom - 20;
    // once every star is found, open the chest as soon as it is in view
    const chest = env.chest;
    if (chest?.unlocked && !chest.open && chestVisible(env, chest)) {
      const n = chestSpot(env, chest);
      if (n) {
        setGoal(me, env, n, false);
        me.toChest = true;
        me.hurry = true;
        return;
      }
    }
    // first, any star in view: go for the nearest one
    const stars = env.stars
      .filter((s) => !s.taken && !s.skip && inView(s.y))
      .sort((a, b) => Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y));
    if (stars.length) {
      const n = nearestNode(env.nav, stars[0].x, stars[0].y + 12, 30);
      if (n) {
        setGoal(me, env, n, false);
        me.chasing = stars[0];
        return;
      }
      stars[0].skip = true;
    }
    // no stars in view: go and play with something nearby (most of the time)
    if (env.rand() < 0.75 && playWithSomething(me, env, inView)) return;
    if (r < 0.4) {
      const near = env.nav.nodes.filter((n) => inView(n.y) && Math.abs(n.x - me.x) + Math.abs(n.y - me.y) < 520);
      const n = near[Math.floor(env.rand() * near.length)];
      if (n) return setGoal(me, env, n, false);
    }
    // now and then hop down through the rule underfoot
    if (r > 0.95 && cell(w, me.x, me.y) === ONEWAY) return dropThrough(me);
    me.mode = r < 0.6 ? "walk" : r < 0.8 ? "run" : r < 0.9 ? "hop" : "idle";
    if (env.rand() < 0.35) me.face *= -1;
    if (me.mode === "hop") return launch(me, me.face * rnd(env, 25, 65), -rnd(env, 195, 280));
  }
  if (me.mode === "sit") return;
  if (me.mode === "idle") return;
  const r = walk(w, me, speed(me, me.mode === "run"), dt);
  if (r === "wall") {
    if (env.rand() < 0.5) launch(me, me.face * 45, -280);
    else me.face *= -1;
  } else if (r === "fall") {
    if (env.rand() < 0.55) stepOff(me, speed(me, me.mode === "run"));
    else me.face *= -1;
  }
}

/**
 * Landing on a spring. On a planned route the bounce is aimed at the next stop; when the
 * spring itself was the goal (the visitor clicked it) the walker cheers and bounces off to the side.
 */
function bounce(me: Walker, env: Env, spring: Prop) {
  spring.bump = 1;
  me.x = spring.x + spring.w / 2;
  me.y = spring.y;
  if (me.jumping && me.path) {
    me.pi++;
    me.plans = 0;
  }
  me.jumping = null;
  // the visitor clicked this very spring: that counts as getting there
  if (me.goal && Math.hypot(me.goal.x - me.x, me.goal.y - me.y) < 10) {
    me.partial = false;
    me.path = [];
    me.pi = 0;
  }
  const next = me.path?.[me.pi];
  if (next?.type === "spring") {
    const arc = ballistic(env.world, me.x, me.y, next.to.x, next.to.y, false, SPRING_V);
    if (arc) return fly(me, next, arc.vx, arc.vy, arc.t);
  }
  if (me.path && !next) arrive(me, env);
  // not aimed anywhere: bounce off to one side so it does not land back on the spring forever
  launch(me, me.face * 70, -SPRING_V);
}

/** The spring the walker's feet are on, if any. */
function springUnder(env: Env, x: number, y: number): Prop | undefined {
  return env.props.find((p) => p.type === "spring" && x >= p.x - 2 && x <= p.x + p.w + 2 && Math.abs(y - p.y) <= S);
}

function land(me: Walker, env: Env) {
  me.dropFrom = null;
  const spring = springUnder(env, me.x, me.y);
  if (spring) return bounce(me, env, spring);
  me.vx = 0;
  me.vy = 0;
  me.ground = true;
  me.acc = 0;
  if (me.jumping) {
    const to = me.jumping.to;
    const ok = segAt(env.world, env.nav, me.x, me.y) === to.seg || Math.hypot(me.x - to.x, me.y - to.y) < 14;
    me.jumping = null;
    if (ok) {
      me.pi++;
      me.plans = 0;
    } else plan(me, env);
  } else if (me.path) plan(me, env);
  if (!me.path) me.mode = env.rand() < 0.4 ? "idle" : "walk";
}

function bumpAt(env: Env, x: number, y: number) {
  for (const p of env.props) {
    if (p.type === "block" && x >= p.x - 2 && x <= p.x + p.w + 2 && y >= p.y && y <= p.y + p.h + 2) p.bump = 1;
  }
}

/**
 * Time runs slower in the air than on the ground: jumps keep the same arc (so planning is
 * unaffected) but float across the page instead of snapping to their target.
 */
const AIR_TIME = 0.6;
const AIR_TIME_HURRY = 0.75;

function air(me: Walker, env: Env, realDt: number) {
  const w = env.world;
  const dt = realDt * (me.hurry ? AIR_TIME_HURRY : AIR_TIME);
  const f = me.flight;
  if (f && me.jumping) {
    f.t = Math.min(f.T, f.t + dt);
    me.x = f.x0 + f.vx * f.t;
    me.y = f.y0 + f.vy * f.t + 0.5 * G * f.t * f.t;
    me.vy = f.vy + G * f.t;
    if (f.t >= f.T) {
      me.x = me.jumping.to.x;
      me.y = me.jumping.to.y;
      me.flight = null;
      land(me, env);
    }
    return;
  }
  me.flight = null;
  me.vy = Math.min(me.vy + G * dt, 450);
  const n = Math.ceil((Math.max(Math.abs(me.vx), Math.abs(me.vy)) * dt) / 1.5) + 1;
  for (let i = 0; i < n; i++) {
    const nx = me.x + (me.vx * dt) / n;
    // in the air, text is only something to land on, never a wall
    if (!hard(w, nx, me.y - 1) && !hard(w, nx, me.y - FH / 2) && !hard(w, nx, me.y - FH)) me.x = nx;
    else me.vx *= -0.25;
    const ny = me.y + (me.vy * dt) / n;
    if (me.vy > 0) {
      for (let r = Math.floor(me.y / S); r <= Math.floor(ny / S); r++) {
        const yy = r * S;
        if (yy < me.y - 0.01) continue;
        if (me.dropFrom !== null && yy <= me.dropFrom + S) continue;
        if (topAt(w, me.x, yy) && !hard(w, me.x, yy - S)) {
          me.y = yy;
          return land(me, env);
        }
      }
      me.y = ny;
    } else if (hard(w, me.x, ny - FH)) {
      me.vy = 0;
      bumpAt(env, me.x, ny - FH);
    } else me.y = ny;
  }
  if (me.y > w.H + 40) respawn(me, env);
}

export function update(me: Walker, env: Env, dt: number) {
  const w = env.world;
  if (me.bubbleT > 0) me.bubbleT -= dt;
  if (me.flag) me.flag.t += dt;
  for (const p of env.props) if (p.bump) p.bump = Math.max(0, p.bump - dt * 5);

  // keep the walker around the part of the page being read
  const out = me.y < env.view.top - 150 || me.y > env.view.bottom + 150;
  me.offscreen = out ? me.offscreen + dt : 0;
  if (me.offscreen > 1.5 && !me.goal) return respawn(me, env);

  if (me.pipe) {
    const P = me.pipe;
    P.t += dt;
    if (P.t < 0.35) {
      [me.x, me.y] = P.from;
      me.sink = P.t / 0.35;
      me.sinkY = P.from[1];
    } else if (P.t < 0.7) {
      [me.x, me.y] = P.to;
      me.sink = 1 - (P.t - 0.35) / 0.35;
      me.sinkY = P.to[1];
    } else {
      me.pipe = null;
      me.sink = 0;
      me.ground = true;
      me.pi++;
    }
    return;
  }
  if (me.climb) {
    const c = me.climb;
    const dir = Math.sign(c.toY - me.y);
    me.x = c.x;
    me.y += dir * (me.hurry ? 70 : 42) * dt;
    me.phase += dt * 10;
    if (dir === 0 || (dir < 0 && me.y <= c.toY) || (dir > 0 && me.y >= c.toY)) {
      me.y = c.toY;
      me.x = dir < 0 ? c.exitX : c.x;
      me.climb = null;
      me.ground = true;
      settle(me, w);
      me.pi++;
    }
    return;
  }
  if (!me.ground) return air(me, env, dt);
  // the chest was just unlocked and is on screen: drop everything (except a visitor's request) and go open it
  const chest = env.chest;
  const view = (y: number) => y > env.view.top + 20 && y < env.view.bottom - 20;
  if (chest?.unlocked && !chest.open && !me.toChest && !(me.hurry && me.goal) && chestVisible(env, chest)) {
    if (!view(me.y)) return respawn(me, env);
    const n = chestSpot(env, chest);
    if (n) {
      me.restAt = null;
      me.mode = "walk";
      setGoal(me, env, n, false);
      me.toChest = true;
      me.hurry = true;
      return;
    }
  }
  if (!groundAt(w, me.x, me.y)) {
    me.ground = false;
    return;
  }
  if (me.wait > 0) {
    me.wait -= dt;
    me.mode = "idle";
    if (me.wait <= 0) plan(me, env);
    return;
  }
  if (me.path) follow(me, env, dt);
  else wander(me, env, dt);
}

/** Whether the walker is sitting at the edge of what it stands on (for the dangling-legs pose). */
export function edgeSide(me: Walker, w: World): -1 | 1 | 0 {
  if (!anyAt(w, me.x - 5, me.y)) return -1;
  if (!anyAt(w, me.x + 5, me.y)) return 1;
  return 0;
}
