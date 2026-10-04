/**
 * The walker's collision map: the page rasterized into S×S-pixel cells.
 *
 * TEXT   — glyph pixels. Solid from above; the walker can jump up through them,
 *          and only the part within KNEE px above the feet blocks walking.
 * ONEWAY — section rules. Solid from above only.
 * HARD   — props (blocks, pipes) and the floor. Solid from every side.
 */
export const S = 2;
export const FH = 14;
export const STEP = 6;
export const KNEE = 8;
export const G = 600;

export const EMPTY = 0;
export const TEXT = 1;
export const ONEWAY = 2;
export const HARD = 3;

export interface World {
  W: number;
  H: number;
  MW: number;
  MH: number;
  mask: Uint8Array;
}

export function createWorld(W: number, H: number): World {
  const MW = Math.ceil(W / S);
  const MH = Math.ceil(H / S);
  return { W, H, MW, MH, mask: new Uint8Array(MW * MH) };
}

export function cell(w: World, x: number, y: number): number {
  const cx = Math.floor(x / S);
  const cy = Math.floor(y / S);
  if (cx < 0 || cx >= w.MW) return HARD;
  if (cy < 0) return EMPTY;
  if (cy >= w.MH) return HARD;
  return w.mask[cy * w.MW + cx];
}

export const hard = (w: World, x: number, y: number) => cell(w, x, y) === HARD;
export const anyAt = (w: World, x: number, y: number) => cell(w, x, y) > 0;

/** Whether the walker's body fits with its feet at (x, y). */
export function bodyFree(w: World, x: number, y: number): boolean {
  for (let k = S; k <= FH; k += S) {
    for (const dx of [-2, 0, 2]) {
      const c = cell(w, x + dx, y - k);
      if (c === HARD || (c === TEXT && k <= KNEE)) return false;
    }
  }
  return true;
}

/** Feet are 5px wide, so the walker does not drop into hairline gaps between glyphs. */
export const groundAt = (w: World, x: number, y: number) =>
  anyAt(w, x - 2, y) || anyAt(w, x, y) || anyAt(w, x + 2, y);

/** Whether the walker can stand with its feet at (x, y): a top surface with room for the body. */
export function standable(w: World, x: number, y: number): boolean {
  if (cell(w, x, y) === EMPTY || cell(w, x, y - S) !== EMPTY) return false;
  for (let k = S; k <= FH; k += S) {
    const c = cell(w, x, y - k);
    if (c === HARD || (c === TEXT && k <= KNEE)) return false;
  }
  return true;
}

/** A solid cell with empty space right above it under the feet: somewhere to land. */
export const topAt = (w: World, x: number, y: number) =>
  [-2, 0, 2].some((dx) => cell(w, x + dx, y) > 0 && cell(w, x + dx, y - S) === EMPTY);

export function fillRect(w: World, x: number, y: number, width: number, height: number, v: number) {
  const cy0 = Math.max(0, Math.floor(y / S));
  const cy1 = Math.min(w.MH, Math.ceil((y + height) / S));
  const cx0 = Math.max(0, Math.floor(x / S));
  const cx1 = Math.min(w.MW, Math.ceil((x + width) / S));
  for (let cy = cy0; cy < cy1; cy++) for (let cx = cx0; cx < cx1; cx++) w.mask[cy * w.MW + cx] = v;
}

export function isEmptyRect(w: World, x: number, y: number, width: number, height: number): boolean {
  if (x < 0 || y < 0 || x + width > w.W || y + height > w.H) return false;
  const cy0 = Math.floor(y / S);
  const cy1 = Math.ceil((y + height) / S);
  const cx0 = Math.floor(x / S);
  const cx1 = Math.ceil((x + width) / S);
  for (let cy = cy0; cy < cy1; cy++) for (let cx = cx0; cx < cx1; cx++) if (w.mask[cy * w.MW + cx]) return false;
  return true;
}

/** Small seeded PRNG (mulberry32) so prop and star placement is stable for a given layout. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
