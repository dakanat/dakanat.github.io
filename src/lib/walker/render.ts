import { fireflyAt, type Bench, type Bird, type Campfire, type Cat, type Chest, type Firefly, type Tuft } from "./decor";
import type { Prop, Star } from "./props";
import { edgeSide, type Walker } from "./walker";
import { FH, type World } from "./world";

/** Objects are drawn in one grey at different strengths, never in colour... */
const ink = (a: number) => `rgba(170, 177, 188, ${a})`;

type RGB = [number, number, number];
/** ...until the chest is opened: then colour spreads out from it (0 = grey, 1 = full colour). */
let colorAt: (x: number, y: number) => number = () => 0;
export function setColorField(fn: (x: number, y: number) => number) {
  colorAt = fn;
}
/** The grey `ink(a)` blended towards `rgb` by how far the colour wave has reached (x, y). */
function paint(a: number, rgb: RGB, x: number, y: number, vivid = Math.min(0.9, a * 3 + 0.35)): string {
  const c = colorAt(x, y);
  if (c <= 0) return ink(a);
  const m = (g: number, v: number) => Math.round(g + (v - g) * c);
  return `rgba(${m(170, rgb[0])}, ${m(177, rgb[1])}, ${m(188, rgb[2])}, ${a + (vivid - a) * c})`;
}

/**
 * The moment the chest opens: three bright rings ripple out from it, and behind them the
 * page background turns from flat black to a dusk-coloured sky (kept dark so text stays readable).
 */
export function drawReveal(g: CanvasRenderingContext2D, cx: number, cy: number, since: number, top: number, bottom: number, left: number, width: number) {
  if (since < 0) return;
  // capped: when progress is restored the chest counts as opened long ago (since = Infinity)
  const R = Math.min(since * 600, 1e5);
  const sky = g.createLinearGradient(0, top, 0, bottom);
  sky.addColorStop(0, "rgba(34, 52, 104, 0.55)");
  sky.addColorStop(0.6, "rgba(52, 40, 92, 0.45)");
  sky.addColorStop(1, "rgba(92, 46, 78, 0.4)");
  g.save();
  g.beginPath();
  g.arc(cx, cy, Math.max(0, R), 0, Math.PI * 2);
  g.clip();
  g.fillStyle = sky;
  g.fillRect(left, top, width, bottom - top);
  g.restore();
  if (since > 4) return;
  for (let k = 0; k < 3; k++) {
    const r = R - k * 90;
    if (r <= 0) continue;
    g.strokeStyle = `rgba(255, 228, 150, ${0.55 * (1 - since / 4) * (1 - k * 0.25)})`;
    g.lineWidth = 3 - k;
    g.beginPath();
    g.arc(cx, cy, r, 0, Math.PI * 2);
    g.stroke();
  }
}

export interface Confetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rgb: RGB;
}

/** Bursts of colour from the chest: pixels flung up that fall and fade over a few seconds. */
export function makeConfetti(cx: number, cy: number, rand: () => number): Confetti[] {
  const colours = Object.values(HUE);
  return Array.from({ length: 70 }, () => {
    const a = -Math.PI / 2 + (rand() - 0.5) * 1.6;
    const v = 180 + rand() * 260;
    return { x: cx, y: cy - 12, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rgb: colours[Math.floor(rand() * colours.length)] };
  });
}

export function drawConfetti(g: CanvasRenderingContext2D, bits: Confetti[], since: number) {
  if (since < 0 || since > 3.5) return;
  const fade = Math.min(1, (3.5 - since) / 1.5);
  for (const b of bits) {
    const x = b.x + b.vx * since * 0.8;
    const y = b.y + b.vy * since + 220 * since * since;
    g.fillStyle = `rgba(${b.rgb[0]}, ${b.rgb[1]}, ${b.rgb[2]}, ${0.9 * fade})`;
    g.fillRect(Math.round(x / PX) * PX, Math.round(y / PX) * PX, PX * 1.5, PX * 1.5);
  }
}
const HUE: Record<string, RGB> = {
  block: [205, 140, 85],
  pipe: [110, 185, 120],
  ladder: [195, 155, 105],
  spring: [225, 105, 105],
  grass: [115, 190, 105],
  bark: [160, 110, 70],
  flame: [245, 140, 60],
  flameCore: [250, 205, 90],
  cat: [215, 170, 120],
  eye: [240, 215, 110],
  heart: [240, 120, 145],
  bird: [120, 170, 235],
  firefly: [210, 245, 120],
};
const FLOWERS: RGB[] = [[240, 140, 170], [245, 220, 120], [235, 235, 245], [175, 160, 240]];

const C = {
  figure: "#c3cbd5",
  flag: "rgb(232, 212, 138)",
  failed: "#8b939e",
  star: "232, 212, 138",
  bubble: "#e9edf1",
  bubbleText: "#14171c",
};

/** Props are drawn on the canvas behind the text. Only the visible ones are drawn. */
export function drawProps(g: CanvasRenderingContext2D, props: Prop[], top: number, bottom: number) {
  g.lineWidth = 1;
  for (const p of props) {
    if (p.y > bottom || p.y + p.h < top) continue;
    g.strokeStyle = paint(0.1, HUE[p.type], p.x, p.y, 0.85);
    g.fillStyle = paint(0.02, HUE[p.type], p.x, p.y, p.type === "block" || p.type === "pipe" ? 0.35 : 0.1);
    const oy = p.bump ? -Math.sin(p.bump * Math.PI) * 5 : 0;
    if (p.type === "block") {
      g.fillRect(p.x, p.y + oy, p.w, p.h);
      g.strokeRect(p.x + 0.5, p.y + 0.5 + oy, p.w - 1, p.h - 1);
      g.strokeRect(p.x + 4.5, p.y + 4.5 + oy, p.w - 9, p.h - 9);
    } else if (p.type === "pipe") {
      g.fillRect(p.x + 3, p.y + 8, p.w - 6, p.h - 8);
      g.strokeRect(p.x + 3.5, p.y + 8.5, p.w - 7, p.h - 9);
      g.fillRect(p.x, p.y, p.w, 8);
      g.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, 8);
      g.beginPath();
      g.moveTo(p.x + 9.5, p.y + 11);
      g.lineTo(p.x + 9.5, p.y + p.h - 3);
      g.stroke();
    } else if (p.type === "spring") {
      sprite(g, p.bump > 0.2 ? SPRING_SQUASHED : SPRING, p.x + p.w / 2, p.y + p.h, { "#": paint(0.32, [200, 200, 210], p.x, p.y), o: paint(0.2, HUE.spring, p.x, p.y) });
    } else {
      g.beginPath();
      g.moveTo(p.x + 0.5, p.y);
      g.lineTo(p.x + 0.5, p.y + p.h);
      g.moveTo(p.x + p.w - 0.5, p.y);
      g.lineTo(p.x + p.w - 0.5, p.y + p.h);
      for (let y = p.y + 7; y < p.y + p.h - 2; y += 9) {
        g.moveTo(p.x, y + 0.5);
        g.lineTo(p.x + p.w, y + 0.5);
      }
      g.stroke();
    }
  }
}

const PX = 2; // size of one "pixel" in the pixel-art sprites
// a coil between a top plate and a base, plus a squashed frame for the bounce
const SPRING = ["#######", ".o...o.", "..#.#..", ".o...o.", "..#.#..", "#######"];
const SPRING_SQUASHED = ["#######", ".o#o#o.", "#######"];

/** Draws a pixel sprite whose bottom-centre sits at (x, y). Each character maps to a colour; "." is empty. */
function sprite(g: CanvasRenderingContext2D, rows: string[], x: number, y: number, colors: Record<string, string>, flip = false) {
  const w = rows[0].length;
  const ox = Math.round(x / PX) * PX - Math.floor(w / 2) * PX;
  const oy = Math.round(y / PX) * PX - rows.length * PX;
  rows.forEach((row, r) => {
    for (let c = 0; c < w; c++) {
      const ch = row[flip ? w - 1 - c : c];
      if (ch === ".") continue;
      g.fillStyle = colors[ch];
      g.fillRect(ox + c * PX, oy + r * PX, PX, PX);
    }
  });
}

// facing right; the tail is drawn separately so it can sway
const CAT = [".....#.#", ".....#e#", "..######", ".#######", ".#.#..#."];
const CAT_STEP = [".....#.#", ".....#e#", "..######", ".#######", "..#.#.#."];
const HEART = [".#.#.", "#####", ".###.", "..#.."];

export function drawCats(g: CanvasRenderingContext2D, cats: Cat[], t: number, top: number, bottom: number) {
  for (const c of cats) {
    if (c.y < top - 30 || c.y > bottom + 30) continue;
    const flip = c.face < 0;
    sprite(g, c.walking && Math.floor(c.step) % 2 ? CAT_STEP : CAT, c.x, c.y, { "#": paint(0.3, HUE.cat, c.x, c.y), e: paint(0.6, HUE.eye, c.x, c.y) }, flip);
    // tail: three pixels curling up behind the cat, swaying
    const back = c.x - c.face * 7;
    const sway = Math.round(Math.sin(t * 2.2 + c.x) * 1.4);
    g.fillStyle = paint(0.3, HUE.cat, c.x, c.y);
    for (let k = 0; k < 3; k++) {
      const px = Math.round((back - c.face * (k < 1 ? 0 : sway)) / PX) * PX;
      g.fillRect(px, Math.round(c.y / PX) * PX - (3 + k) * PX, PX, PX);
    }
    if (c.heart > 0) {
      g.globalAlpha = Math.min(1, c.heart);
      sprite(g, HEART, c.x, c.y - 14 - (1.6 - c.heart) * 10, { "#": paint(0.55, HUE.heart, c.x, c.y) });
      g.globalAlpha = 1;
    }
  }
}

export function drawGrass(g: CanvasRenderingContext2D, tufts: Tuft[], t: number, top: number, bottom: number) {
  for (const tf of tufts) {
    if (tf.y < top - 20 || tf.y > bottom + 20) continue;
    const sway = Math.sin(t * 1.4 + tf.x * 0.07) * 0.7 + tf.bend * 2;
    const baseX = Math.round(tf.x / PX) * PX;
    const baseY = Math.round(tf.y / PX) * PX;
    tf.blades.forEach((b, i) => {
      let tipX = 0;
      for (let k = 0; k < b.h; k++) {
        const off = Math.round((sway * (k + 1)) / b.h);
        tipX = baseX + (i * 2 - 1) * PX + off * PX;
        g.fillStyle = paint(k === b.h - 1 ? 0.26 : 0.18, HUE.grass, tf.x, tf.y);
        g.fillRect(tipX, baseY - (k + 1) * PX, PX, PX);
      }
      if (b.flower) {
        const fy = baseY - (b.h + 1) * PX;
        g.fillStyle = paint(0.34, FLOWERS[(i + Math.round(tf.x)) % FLOWERS.length], tf.x, tf.y);
        g.fillRect(tipX - PX, fy, PX, PX);
        g.fillRect(tipX + PX, fy, PX, PX);
        g.fillRect(tipX, fy - PX, PX, PX);
        g.fillRect(tipX, fy + PX, PX, PX);
        g.fillStyle = paint(0.5, HUE.eye, tf.x, tf.y);
        g.fillRect(tipX, fy, PX, PX);
      }
    });
  }
}

/** A soft warm glow under each campfire, drawn behind the text. */
export function drawFireGlow(g: CanvasRenderingContext2D, fires: Campfire[], t: number, top: number, bottom: number) {
  for (const f of fires) {
    if (f.y < top - 80 || f.y > bottom + 80) continue;
    const flick = 0.9 + Math.sin(t * 9 + f.seed) * 0.05 + Math.sin(t * 23 + f.seed) * 0.05;
    const grad = g.createRadialGradient(f.x, f.y - 8, 2, f.x, f.y - 8, 60 * flick);
    grad.addColorStop(0, paint(0.05, HUE.flame, f.x, f.y, 0.22));
    grad.addColorStop(1, paint(0, HUE.flame, f.x, f.y, 0));
    g.fillStyle = grad;
    g.fillRect(f.x - 64, f.y - 72, 128, 128);
  }
}

const LOGS = ["#..#..#", ".#####.", "###.###"];
const FLAMES = [
  ["...o...", "..oyo..", ".oyyyo.", ".oywyo.", "..oyo.."],
  ["....o..", "...oo..", "..oyyo.", ".oyywo.", "..oyo.."],
  ["..o....", "..oo...", ".oyyo..", ".oywyo.", "..oyo.."],
];

export function drawCampfires(g: CanvasRenderingContext2D, fires: Campfire[], t: number, top: number, bottom: number) {
  for (const f of fires) {
    if (f.y < top - 40 || f.y > bottom + 40) continue;
    sprite(g, LOGS, f.x, f.y, { "#": paint(0.28, HUE.bark, f.x, f.y) });
    const frame = FLAMES[Math.floor(t * 8 + f.seed) % FLAMES.length];
    sprite(g, frame, f.x, f.y - 3 * PX, { o: paint(0.22, HUE.flame, f.x, f.y), y: paint(0.36, HUE.flameCore, f.x, f.y), w: paint(0.55, [255, 240, 200], f.x, f.y) });
    // sparks: each one rises and fades on its own cycle
    for (let k = 0; k < 4; k++) {
      const cycle = (t * 0.7 + k * 0.27 + f.seed) % 1;
      const sx = f.x + Math.sin(k * 7.1 + Math.floor(t * 0.7 + k * 0.27 + f.seed) * 3.3) * 6 + Math.sin(cycle * 6) * 2;
      const sy = f.y - 18 - cycle * 26;
      g.fillStyle = paint(0.4 * (1 - cycle), HUE.flame, f.x, f.y, 0.9 * (1 - cycle));
      g.fillRect(Math.round(sx / PX) * PX, Math.round(sy / PX) * PX, PX, PX);
    }
  }
}

// front view: two backrest slats, the seat, and the legs at both ends
const BENCH = ["############", "#..........#", "############", "#..........#", "############", "#..........#", "#..........#"];
/** Height of the bench seat above the ground, in px. */
export const BENCH_SEAT = 6;
const CHEST_CLOSED = [".########.", "#........#", "##########", "#...##...#", "#........#", "##########"];
const CHEST_OPEN = [".########.", "#........#", "..........", "##########", "#...##...#", "#........#", "##########"];

export function drawBenches(g: CanvasRenderingContext2D, benches: Bench[], top: number, bottom: number) {
  for (const b of benches) {
    if (b.y < top - 20 || b.y > bottom + 20) continue;
    sprite(g, BENCH, b.x, b.y, { "#": paint(0.24, HUE.ladder, b.x, b.y) });
  }
}

export function drawChest(g: CanvasRenderingContext2D, chest: Chest | null, t: number, top: number, bottom: number) {
  if (!chest || chest.y < top - 30 || chest.y > bottom + 30) return;
  // the chest is the one object in the star colour: it is where the stars lead.
  // Locked it is faint; unlocked it pulses; open it glints.
  const a = chest.open ? 0.75 : chest.unlocked ? 0.55 + 0.25 * Math.sin(t * 4) : 0.3;
  sprite(g, chest.open ? CHEST_OPEN : CHEST_CLOSED, chest.x, chest.y, { "#": `rgba(${C.star}, ${a})` });
  if (!chest.open) return;
  // a few glints rising out of the open chest
  for (let k = 0; k < 3; k++) {
    const cycle = (t * 0.5 + k / 3) % 1;
    g.fillStyle = `rgba(${C.star}, ${0.7 * (1 - cycle)})`;
    g.fillRect(Math.round((chest.x - 6 + k * 6) / PX) * PX, Math.round((chest.y - 16 - cycle * 18) / PX) * PX, PX, PX);
  }
}

export function drawFireflies(g: CanvasRenderingContext2D, flies: Firefly[], t: number, top: number, bottom: number) {
  for (const f of flies) {
    if (f.cy < top - 60 || f.cy > bottom + 60) continue;
    const blink = Math.max(0, Math.sin(t * 1.7 + f.phase * 3));
    if (blink < 0.05) continue;
    const [x, y] = fireflyAt(f, t);
    const px = Math.round(x / PX) * PX;
    const py = Math.round(y / PX) * PX;
    g.fillStyle = paint(0.06 * blink, HUE.firefly, f.cx, f.cy, 0.2 * blink);
    g.fillRect(px - PX, py - PX, PX * 3, PX * 3);
    g.fillStyle = paint(0.5 * blink, HUE.firefly, f.cx, f.cy, 0.95 * blink);
    g.fillRect(px, py, PX, PX);
  }
}

export function drawBirds(g: CanvasRenderingContext2D, birds: Bird[], t: number, top: number, bottom: number) {
  g.lineCap = "round";
  g.lineWidth = 1.2;
  g.lineCap = "round";
  for (const b of birds) {
    if (b.y < top - 20 || b.y > bottom + 20) continue;
    g.strokeStyle = g.fillStyle = paint(0.32, HUE.bird, b.homeX, b.homeY);
    if (b.flying) {
      const flap = Math.sin(t * 18 + b.homeX) * 3;
      g.beginPath();
      g.moveTo(b.x - 5, b.y - 2 - flap);
      g.lineTo(b.x, b.y);
      g.lineTo(b.x + 5, b.y - 2 - flap);
      g.stroke();
    } else {
      g.beginPath();
      g.ellipse(b.x, b.y - 3, 3, 2.2, 0, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(b.x + b.face * 2.6, b.y - 5.4, 1.5, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(b.x - b.face * 2.5, b.y - 3);
      g.lineTo(b.x - b.face * 5, b.y - 4.5);
      g.moveTo(b.x - 1, b.y - 1);
      g.lineTo(b.x - 1, b.y);
      g.moveTo(b.x + 1, b.y - 1);
      g.lineTo(b.x + 1, b.y);
      g.stroke();
    }
  }
}

export function drawStars(g: CanvasRenderingContext2D, stars: Star[], t: number, top: number, bottom: number) {
  for (const s of stars) {
    if (s.taken || s.y < top - 10 || s.y > bottom + 10) continue;
    const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + s.phase);
    const r = 3.6 + tw * 0.8;
    g.fillStyle = `rgba(${C.star}, ${0.45 + 0.4 * tw})`;
    g.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 - Math.PI / 2;
      const rr = k % 2 ? r * 0.38 : r;
      const px = s.x + Math.cos(a) * rr;
      const py = s.y + Math.sin(a) * rr;
      if (k) g.lineTo(px, py);
      else g.moveTo(px, py);
    }
    g.closePath();
    g.fill();
  }
}

export function drawFlag(g: CanvasRenderingContext2D, me: Walker) {
  const f = me.flag;
  if (!f) return;
  const a = f.fail ? Math.max(0, 1 - f.t / 1.5) : 1;
  if (a <= 0) {
    me.flag = null;
    return;
  }
  g.globalAlpha = a;
  g.strokeStyle = g.fillStyle = f.fail ? C.failed : C.flag;
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(f.x, f.y);
  g.lineTo(f.x, f.y - 14);
  g.stroke();
  g.beginPath();
  g.moveTo(f.x, f.y - 14);
  g.lineTo(f.x + 8, f.y - 11);
  g.lineTo(f.x, f.y - 8);
  g.fill();
  g.globalAlpha = 1;
}

/** The stick figure: climbing, sitting on an edge with dangling legs, or walking/running/jumping. */
export function drawWalker(g: CanvasRenderingContext2D, me: Walker, w: World, t: number) {
  const { x, y, face } = me;
  g.save();
  if (me.sink) {
    g.beginPath();
    g.rect(x - 40, me.sinkY - 200, 80, 200);
    g.clip();
    g.translate(0, me.sink * (FH + 4));
  }
  g.strokeStyle = C.figure;
  g.lineWidth = 1.6;
  g.lineCap = "round";
  g.lineJoin = "round";
  const head = (hx: number, hy: number) => {
    g.stroke();
    g.beginPath();
    g.arc(hx, hy, 2.4, 0, Math.PI * 2);
    g.stroke();
  };
  g.beginPath();
  if (me.climb) {
    const s = Math.sin(me.phase);
    g.moveTo(x, y - 6);
    g.lineTo(x, y - 10.5);
    g.moveTo(x, y - 6);
    g.lineTo(x - 3, y - 3 + s * 2);
    g.lineTo(x - 3, y);
    g.moveTo(x, y - 6);
    g.lineTo(x + 3, y - 3 - s * 2);
    g.lineTo(x + 3, y);
    g.moveTo(x, y - 10.5);
    g.lineTo(x - 4, y - 14 - s * 2);
    g.moveTo(x, y - 10.5);
    g.lineTo(x + 4, y - 14 + s * 2);
    head(x, y - 13.3);
    g.restore();
    return;
  }
  if (me.ground && me.mode === "sit" && me.seat > 0) {
    // lounging on the bench: lying along the seat, propped up on one elbow,
    // one knee raised and the foot tapping; `face` picks which end the head is at
    const hy = y - me.seat;
    const f = -face;
    const tap = Math.sin(t * 3) * 0.6;
    const bob = Math.sin(t * 1.2) * 0.3;
    g.moveTo(x + f * 6, hy - 1); // elbow on the seat
    g.lineTo(x + f * 7, hy - 5.5); // hand up to the head
    g.moveTo(x + f * 4.5, hy - 2.5); // shoulder
    g.lineTo(x - f * 2, hy - 1.2); // hip
    g.lineTo(x - f * 9, hy - 0.8); // straight leg
    g.moveTo(x - f * 2, hy - 1.2);
    g.lineTo(x - f * 5, hy - 5 + tap * 0.3); // raised knee
    g.lineTo(x - f * 8, hy - 1 + tap); // foot
    head(x + f * 6.6, hy - 8.2 + bob);
    g.restore();
    // a lazy "z z Z" drifting up
    for (let k = 0; k < 3; k++) {
      const c = (t * 0.45 + k / 3) % 1;
      g.globalAlpha = 0.7 * (1 - c);
      g.fillStyle = C.figure;
      g.font = `600 ${7 + k * 2}px sans-serif`;
      g.textAlign = "center";
      g.fillText(k === 2 ? "Z" : "z", x + f * (8 + c * 6), hy - 14 - c * 16 - k * 3);
    }
    g.globalAlpha = 1;
    return;
  }
  if (me.ground && me.mode === "sit") {
    // sitting on the ground by the fire, knees up, arms around them, facing `face`;
    // now and then hums a little
    if (Math.sin(t * 0.9) > 0.6) {
      drawBubble(g, x, y - FH - 8, "♪");
      g.beginPath();
    }
    g.moveTo(x, y - 1);
    g.lineTo(x - face * 0.5, y - 9);
    g.moveTo(x, y - 1);
    g.lineTo(x + face * 4, y - 5);
    g.lineTo(x + face * 7, y);
    g.moveTo(x - face * 0.4, y - 7.5);
    g.lineTo(x + face * 4, y - 5.5);
    head(x - face * 0.5 + Math.sin(t * 1.3) * 0.3, y - 11.6);
    g.restore();
    return;
  }
  const idle = me.ground && (me.mode === "idle" || me.wait > 0) && !me.path;
  const edge = idle && !me.wait ? edgeSide(me, w) : 0;
  if (edge) {
    const sw = Math.sin(t * 4);
    const sh: [number, number] = [x - edge, y - 8.5];
    g.moveTo(x, y - 1);
    g.lineTo(...sh);
    g.moveTo(sh[0], sh[1] + 1);
    g.lineTo(x + edge * 3, y - 2);
    for (const k of [1, -1]) {
      g.moveTo(x, y - 1);
      g.lineTo(x + edge * 4, y);
      g.lineTo(x + edge * (4 + sw * k * 2), y + 5);
    }
    head(sh[0], sh[1] - 3);
    g.restore();
    return;
  }
  const inAir = !me.ground;
  const run = me.mode === "run" && !inAir;
  const lean = run ? 2 * face : 0;
  const amp = inAir || idle || me.wait > 0 ? 0 : run ? 0.95 : 0.6;
  const breathe = idle ? Math.sin(t * 2) * 0.35 : 0;
  const hip: [number, number] = [x, y - 6];
  const sh: [number, number] = [x + lean, y - 10.5 + breathe];
  g.moveTo(...hip);
  g.lineTo(...sh);
  for (const k of [1, -1]) {
    const a = inAir ? (me.vy < 0 ? 0.6 : 0.3) * k : Math.sin(me.phase) * amp * k;
    const lift = inAir && me.vy < 0 ? 2 : 0;
    g.moveTo(...hip);
    g.lineTo(hip[0] + Math.sin(a) * 3 + (inAir ? face * 1.5 : 0), hip[1] + Math.cos(a) * 3 - lift);
    g.lineTo(hip[0] + Math.sin(a) * 5.5, hip[1] + Math.cos(a) * 6 - lift);
    const arm = inAir ? -2.4 * k : -Math.sin(me.phase) * amp * k;
    g.moveTo(sh[0], sh[1] + 1);
    g.lineTo(sh[0] + Math.sin(arm) * 4.5, sh[1] + 1 + Math.cos(arm) * 4.5);
  }
  head(sh[0] + lean * 0.3, sh[1] - 2.8);
  g.restore();

  if (me.bubbleT > 0 && me.bubble) drawBubble(g, x, y - FH - 12, me.bubble);
}

function drawBubble(g: CanvasRenderingContext2D, x: number, by: number, text: string) {
  g.save();
  g.font = "600 11px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = C.bubble;
  g.beginPath();
  g.roundRect(x - 8, by - 8, 16, 15, 4);
  g.fill();
  g.beginPath();
  g.moveTo(x - 3, by + 6);
  g.lineTo(x, by + 10);
  g.lineTo(x + 3, by + 6);
  g.fill();
  g.fillStyle = C.bubbleText;
  g.fillText(text, x, by);
  g.restore();
}
