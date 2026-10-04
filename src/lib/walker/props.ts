import type { Nav, Special } from "./nav";
import { EMPTY, HARD, S, TEXT, fillRect, isEmptyRect, standable, type World } from "./world";

export interface Prop {
  type: "block" | "pipe" | "ladder" | "spring";
  x: number;
  y: number;
  w: number;
  h: number;
  /** 0..1, set when the walker head-butts a block or bounces on a spring */
  bump: number;
}

/** A horizontal rule (section border) the walker can stand on. */
export interface Rule {
  x1: number;
  x2: number;
  y: number;
}

export interface Star {
  x: number;
  y: number;
  taken: boolean;
  phase: number;
  /** the walker tried and could not reach it; it stops chasing it */
  skip?: boolean;
}

const BLOCK = 16;
const PIPE_W = 30;
const PIPE_H = 36;
const SPRING_W = 14;
const SPRING_H = 12;
const LADDER_W = 14;
const LADDER_MIN = 40;
const LADDER_MAX = 200;
const LADDER_MAX_TEXT = 0.04; // share of the ladder's strip that may run behind text

const snap = (v: number) => Math.round(v / S) * S;

/**
 * Scatters faint props over the empty parts of the page:
 * short ladders between two standable spots one above the other (mostly through empty space),
 * pairs of linked pipes standing on rules, and small block structures (stairs, stacks, bridges).
 * Writes the solid props into the world and returns the links they add to navigation.
 */
export function placeProps(
  w: World,
  rules: Rule[],
  floorY: number,
  rand: () => number,
): { props: Prop[]; specials: Special[]; perches: { x: number; y: number }[] } {
  const props: Prop[] = [];
  const specials: Special[] = [];
  /** tops of block structures, where a star looks placed on purpose */
  const perches: { x: number; y: number }[] = [];
  const overlaps = (x: number, y: number, pw: number, ph: number, m: number) =>
    props.some((p) => x < p.x + p.w + m && x + pw > p.x - m && y < p.y + p.h + m && y + ph > p.y - m);

  const sorted = [...rules].sort((a, b) => a.y - b.y);
  const wanted = Math.max(2, Math.round(w.H / 180));
  let ladders = 0;
  for (let tries = 0; tries < wanted * 30 && ladders < wanted; tries++) {
    const x = snap(8 + rand() * (w.W - LADDER_W - 16));
    const mid = x + LADDER_W / 2;
    const ys: number[] = [];
    for (let y = S; y < w.H; y += S) if (standable(w, mid, y)) ys.push(y);
    if (ys.length < 2) continue;
    const top = ys[Math.floor(rand() * (ys.length - 1))];
    const bottom = ys.find((y) => y - top >= LADDER_MIN);
    if (bottom === undefined || bottom - top > LADDER_MAX) continue;
    if (overlaps(x, top, LADDER_W, bottom - top, 24)) continue;
    if (!stripClear(w, x, top + S, LADDER_W, bottom - top - 2 * S)) continue;
    props.push({ type: "ladder", x, y: top, w: LADDER_W, h: bottom - top, bump: 0 });
    specials.push({ kind: "ladder", x: mid, top: [mid, top], bottom: [mid, bottom] });
    ladders++;
  }

  // pipes stand on rules or on the floor, and come in linked pairs far apart vertically
  const bases = [...sorted, { x1: 0, x2: w.W, y: floorY }];
  const spots: { x: number; y: number }[] = [];
  for (const r of bases) {
    for (let x = snap(r.x1 + 8); x <= r.x2 - PIPE_W - 8; x += 12) {
      if (isEmptyRect(w, x - 4, r.y - PIPE_H - 6, PIPE_W + 8, PIPE_H + 6)) spots.push({ x, y: r.y });
    }
  }
  const pairs = Math.max(1, Math.min(3, Math.round(w.H / 1400)));
  for (let p = 0; p < pairs && spots.length > 1; p++) {
    const free = spots.filter((s) => !overlaps(s.x, s.y - PIPE_H, PIPE_W, PIPE_H, 40));
    if (free.length < 2) break;
    const a = free[Math.floor(rand() * free.length)];
    const far = free.filter((s) => Math.abs(s.y - a.y) > w.H / 3);
    if (!far.length) break;
    const b = far[Math.floor(rand() * far.length)];
    for (const s of [a, b]) props.push({ type: "pipe", x: s.x, y: s.y - PIPE_H, w: PIPE_W, h: PIPE_H, bump: 0 });
    specials.push({ kind: "pipe", a: [a.x + PIPE_W / 2, a.y - PIPE_H], b: [b.x + PIPE_W / 2, b.y - PIPE_H] });
  }

  // block structures: small, deliberate shapes rather than loose noise.
  // Grounded ones (stairs, stacks) stand on rules or the floor; floating ones (bridges, steps) sit in open space.
  const structures: { x: number; y: number }[] = [];
  const farFromOthers = (x: number, y: number) => structures.every((st) => Math.hypot(st.x - x, st.y - y) > 160);
  const tryPlace = (cells: [number, number][], ax: number, baseY: number) => {
    const cols = Math.max(...cells.map(([c]) => c)) + 1;
    const rows = Math.max(...cells.map(([, r]) => r)) + 1;
    const x0 = snap(ax);
    const top = baseY - rows * BLOCK;
    if (!isEmptyRect(w, x0 - 8, top - 14, cols * BLOCK + 16, rows * BLOCK + 14)) return false;
    if (overlaps(x0, top, cols * BLOCK, rows * BLOCK, 20) || !farFromOthers(x0, top)) return false;
    for (const [c, r] of cells) props.push({ type: "block", x: x0 + c * BLOCK, y: baseY - (r + 1) * BLOCK, w: BLOCK, h: BLOCK, bump: 0 });
    structures.push({ x: x0, y: top });
    const topRow = Math.max(...cells.map(([, r]) => r));
    const [tc] = cells.find(([, r]) => r === topRow)!;
    perches.push({ x: x0 + tc * BLOCK + BLOCK / 2, y: baseY - (topRow + 1) * BLOCK });
    return true;
  };
  const grounded: [number, number][][] = [
    [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2]], // stairs up to the right
    [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0]], // stairs up to the left
    [[0, 0], [0, 1]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1]],
  ];
  const floating: [number, number][][] = [
    [[0, 0], [1, 0], [2, 0]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [2, 1], [4, 2]], // stepping stones going up
    [[0, 2], [2, 1], [4, 0]], // and going down
  ];
  const wantGrounded = Math.max(4, Math.round(w.H / 300));
  for (let tries = 0, n = 0; tries < 400 && n < wantGrounded; tries++) {
    const base = bases[Math.floor(rand() * bases.length)];
    const ax = base.x1 + 8 + rand() * Math.max(0, base.x2 - base.x1 - 80);
    if (tryPlace(maybeMirror(grounded[Math.floor(rand() * grounded.length)], rand), ax, base.y)) n++;
  }
  // the side margins are the emptiest part of the page, so floating structures are denser there
  const wantFloating = Math.max(5, Math.round(w.H / 200));
  for (let tries = 0, n = 0; tries < 1200 && n < wantFloating; tries++) {
    const ax = 8 + rand() * (w.W - 100);
    const baseY = snap(100 + rand() * (floorY - 160));
    if (tryPlace(maybeMirror(floating[Math.floor(rand() * floating.length)], rand), ax, baseY)) n++;
  }

  // springs on structure tops, rules and the floor; landing on one bounces the walker high
  const onRules = Array.from({ length: Math.max(4, Math.round(w.H / 350)) }, () => {
    const r = bases[Math.floor(rand() * bases.length)];
    return { x: r.x1 + 12 + rand() * Math.max(0, r.x2 - r.x1 - 24), y: r.y };
  });
  const springSpots = [...perches.filter(() => rand() < 0.5), ...onRules];
  for (const sp of springSpots) {
    const x = snap(sp.x - SPRING_W / 2);
    const y = sp.y - SPRING_H;
    if (!isEmptyRect(w, x - 2, y - 10, SPRING_W + 4, SPRING_H + 10) || overlaps(x, y, SPRING_W, SPRING_H, 10)) continue;
    props.push({ type: "spring", x, y, w: SPRING_W, h: SPRING_H, bump: 0 });
    specials.push({ kind: "spring", top: [x + SPRING_W / 2, y] });
  }

  for (const p of props) if (p.type !== "ladder") fillRect(w, p.x, p.y, p.w, p.h, HARD);
  return { props, specials, perches };
}

/** Flips a block pattern left-to-right half of the time, so stairs face both ways. */
function maybeMirror(cells: [number, number][], rand: () => number): [number, number][] {
  if (rand() < 0.5) return cells;
  const cols = Math.max(...cells.map(([c]) => c));
  return cells.map(([c, r]) => [cols - c, r]);
}

/** No hard cells, and only a little text, in the strip a ladder would occupy. */
function stripClear(w: World, x: number, y: number, width: number, height: number): boolean {
  let text = 0;
  let total = 0;
  for (let cy = Math.floor(y / S); cy < Math.ceil((y + height) / S); cy++) {
    for (let cx = Math.floor(x / S); cx < Math.ceil((x + width) / S); cx++) {
      const v = cx >= 0 && cx < w.MW && cy >= 0 && cy < w.MH ? w.mask[cy * w.MW + cx] : HARD;
      if (v === HARD) return false;
      if (v === TEXT) text++;
      else if (v !== EMPTY) return false;
      total++;
    }
  }
  return total > 0 && text / total <= LADDER_MAX_TEXT;
}

/**
 * Spreads collectible stars just above standable spots, at least `minDist` apart and never
 * over text or props. Some go on top of block structures first, so they look placed on purpose.
 */
export function placeStars(
  w: World,
  nav: Nav,
  count: number,
  rand: () => number,
  minDist = 110,
  perches: { x: number; y: number }[] = [],
): Star[] {
  const stars: Star[] = [];
  const fits = (x: number, y: number) =>
    isEmptyRect(w, x - 7, y - 7, 14, 14) && stars.every((s) => Math.hypot(s.x - x, s.y - y) >= minDist);
  const add = (x: number, y: number) => {
    if (stars.length < count && fits(x, y)) stars.push({ x, y, taken: false, phase: rand() * Math.PI * 2 });
  };
  for (const p of perches.slice(0, Math.ceil(count * 0.4))) add(p.x, p.y - 12);
  const order = nav.nodes.map((n) => ({ n, k: rand() })).sort((a, b) => a.k - b.k);
  for (const { n } of order) add(n.x, n.y - 12);
  return stars;
}
