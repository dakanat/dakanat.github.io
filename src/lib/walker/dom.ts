import type { Rule } from "./props";
import { HARD, ONEWAY, S, TEXT, createWorld, fillRect, type World } from "./world";

/** Where one rendered character sits (root coordinates), and which text it came from. */
export interface CharBox {
  node: Text;
  offset: number;
  length: number;
  x1: number;
  x2: number;
  top: number;
  bottom: number;
}

const BAND = 2048; // rasterize in horizontal bands to stay under mobile canvas size limits

/**
 * Builds the collision map from what the browser actually rendered: every character
 * is located with a Range and redrawn with its computed font on an offscreen canvas,
 * so the walker stands on the real glyph shapes. Elements marked [data-ground] add
 * one-way rules along their top border, and a hard floor closes off the bottom.
 */
export function rasterize(root: HTMLElement): { world: World; rules: Rule[]; floorY: number; chars: CharBox[] } {
  const rr = root.getBoundingClientRect();
  const W = Math.ceil(root.clientWidth);
  const H = Math.ceil(root.scrollHeight);
  const world = createWorld(W, H);
  const draws: { ch: string; font: string; x: number; base: number; top: number; bottom: number }[] = [];
  const chars: CharBox[] = [];
  const range = document.createRange();
  const ascent = new Map<string, number>();
  const probe = document.createElement("canvas").getContext("2d")!;
  const walkerText = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.textContent?.trim() && !n.parentElement?.closest("[data-walker-ignore]")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  for (let n = walkerText.nextNode(); n; n = walkerText.nextNode()) {
    const st = getComputedStyle(n.parentElement!);
    if (st.visibility === "hidden") continue;
    const font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
    if (!ascent.has(font)) {
      probe.font = font;
      ascent.set(font, probe.measureText("M").fontBoundingBoxAscent);
    }
    const text = n.textContent!;
    let i = 0;
    for (const ch of text) {
      if (ch.trim()) {
        range.setStart(n, i);
        range.setEnd(n, i + ch.length);
        const r = range.getClientRects()[0];
        if (r && r.width > 0) {
          const top = r.top - rr.top;
          draws.push({ ch, font, x: r.left - rr.left, base: top + ascent.get(font)!, top, bottom: r.bottom - rr.top });
          chars.push({ node: n as Text, offset: i, length: ch.length, x1: r.left - rr.left, x2: r.right - rr.left, top, bottom: r.bottom - rr.top });
        }
      }
      i += ch.length;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = W;
  for (let y0 = 0; y0 < H; y0 += BAND) {
    const bh = Math.min(BAND, H - y0);
    canvas.height = bh;
    const g = canvas.getContext("2d", { willReadFrequently: true })!;
    g.clearRect(0, 0, W, bh);
    g.fillStyle = "#000";
    g.textBaseline = "alphabetic";
    g.textAlign = "left";
    let font = "";
    for (const d of draws) {
      if (d.bottom < y0 || d.top > y0 + bh) continue;
      if (d.font !== font) g.font = font = d.font;
      g.fillText(d.ch, d.x, d.base - y0);
    }
    const data = g.getImageData(0, 0, W, bh).data;
    for (let cy = Math.floor(y0 / S); cy < Math.min(world.MH, Math.ceil((y0 + bh) / S)); cy++) {
      for (let cx = 0; cx < world.MW; cx++) {
        let on = false;
        for (let dy = 0; dy < S && !on; dy++) {
          const py = cy * S + dy - y0;
          if (py < 0 || py >= bh) continue;
          for (let dx = 0; dx < S; dx++) {
            const px = cx * S + dx;
            if (px < W && data[(py * W + px) * 4 + 3] > 90) {
              on = true;
              break;
            }
          }
        }
        if (on) world.mask[cy * world.MW + cx] = TEXT;
      }
    }
  }
  const rules: Rule[] = [];
  root.querySelectorAll<HTMLElement>("[data-ground]").forEach((el) => {
    const r = el.getBoundingClientRect();
    const y = Math.round((r.top - rr.top) / S) * S;
    const rule = { x1: r.left - rr.left, x2: r.right - rr.left, y };
    rules.push(rule);
    for (let cx = Math.max(0, Math.floor(rule.x1 / S)); cx < Math.min(world.MW, rule.x2 / S); cx++) {
      const i = (y / S) * world.MW + cx;
      if (!world.mask[i]) world.mask[i] = ONEWAY;
    }
  });
  const floorY = Math.floor((H - 8) / S) * S;
  fillRect(world, 0, floorY, W, H - floorY, HARD);
  return { world, rules, floorY, chars };
}
