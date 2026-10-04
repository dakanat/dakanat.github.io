import { describe, it, expect } from "vitest";
import { buildNav } from "@/lib/walker/nav";
import { placeProps, placeStars } from "@/lib/walker/props";
import { HARD, ONEWAY, TEXT, cell, createWorld, fillRect, isEmptyRect, seeded } from "@/lib/walker/world";

function page() {
  const w = createWorld(600, 3000);
  const rules = [200, 900, 1600, 2300].map((y) => ({ x1: 0, x2: 600, y }));
  for (const r of rules) fillRect(w, r.x1, r.y, r.x2 - r.x1, 2, ONEWAY);
  // text fills the left half of each section
  for (const r of rules) fillRect(w, 0, r.y + 20, 300, 400, TEXT);
  const floorY = 2990;
  fillRect(w, 0, floorY, 600, 10, HARD);
  return { w, rules, floorY };
}

describe("placeProps", () => {
  it("scatters short ladders that join two standable spots, mostly through empty space", () => {
    const { w, rules, floorY } = page();
    // short text lines on the right half, 80px apart, give ladders something to connect
    for (let y = 240; y < 2900; y += 80) fillRect(w, 340, y, 200, 4, TEXT);
    const before = w.mask.slice();
    const { props, specials } = placeProps(w, rules, floorY, seeded(1));
    const ladders = props.filter((p) => p.type === "ladder");
    expect(ladders.length).toBeGreaterThan(3);
    for (const l of ladders) {
      expect(l.h).toBeGreaterThanOrEqual(40);
      expect(l.h).toBeLessThanOrEqual(200);
      let text = 0;
      let total = 0;
      for (let y = l.y + 2; y < l.y + l.h - 2; y += 2) {
        for (let x = l.x; x < l.x + l.w; x += 2) {
          if (before[Math.floor(y / 2) * w.MW + Math.floor(x / 2)] === TEXT) text++;
          total++;
        }
      }
      expect(text / total).toBeLessThanOrEqual(0.04);
    }
    expect(specials.filter((s) => s.kind === "ladder")).toHaveLength(ladders.length);
  });

  it("places linked pipes far apart and makes them solid", () => {
    const { w, rules, floorY } = page();
    const { props, specials } = placeProps(w, rules, floorY, seeded(2));
    const pipes = props.filter((p) => p.type === "pipe");
    expect(pipes.length).toBeGreaterThanOrEqual(2);
    const pair = specials.find((s) => s.kind === "pipe");
    expect(pair && pair.kind === "pipe" && Math.abs(pair.a[1] - pair.b[1])).toBeGreaterThan(1000);
    expect(cell(w, pipes[0].x + 10, pipes[0].y + 10)).toBe(HARD);
  });

  it("builds blocks as structures of touching blocks, never on top of text", () => {
    const { w, rules, floorY } = page();
    const before = w.mask.slice();
    const { props } = placeProps(w, rules, floorY, seeded(3));
    const blocks = props.filter((p) => p.type === "block");
    expect(blocks.length).toBeGreaterThan(0);
    // every block touches another block or stands alone as part of a deliberate stepping-stone pattern
    const touching = blocks.filter((b) => blocks.some((o) => o !== b && Math.abs(o.x - b.x) + Math.abs(o.y - b.y) === 16));
    expect(touching.length / blocks.length).toBeGreaterThan(0.5);
    for (const b of blocks) {
      for (let y = b.y; y < b.y + b.h; y += 2) {
        for (let x = b.x; x < b.x + b.w; x += 2) {
          expect(before[Math.floor(y / 2) * w.MW + Math.floor(x / 2)]).toBe(0);
        }
      }
    }
  });
});

describe("placeProps on a wide page", () => {
  it("only floats block structures within jump range of somewhere already standable", () => {
    // content in the middle third, wide empty margins on both sides
    const w = createWorld(2400, 2000);
    const rules = [300, 900, 1500].map((y) => ({ x1: 800, x2: 1600, y }));
    for (const r of rules) fillRect(w, r.x1, r.y, r.x2 - r.x1, 2, ONEWAY);
    const floorY = 1990;
    fillRect(w, 0, floorY, 2400, 10, HARD);
    const { props } = placeProps(w, rules, floorY, seeded(12));
    const blocks = props.filter((p) => p.type === "block");
    expect(blocks.some((b) => b.x < 600 || b.x > 1800)).toBe(true); // the margins do get some
    // every block is near a rule, the floor, or another block (structures chain outwards)
    const anchors = [...rules.flatMap((r) => [r.x1, r.x2].map((x) => ({ x, y: r.y }))), ...blocks];
    for (const b of blocks) {
      const nearFloor = floorY - b.y <= 300;
      const nearRule = rules.some((r) => Math.max(0, r.x1 - b.x, b.x - r.x2) <= 216 && Math.abs(r.y - b.y) <= 300);
      const nearBlock = anchors.some((o) => o !== b && Math.abs(o.x - b.x) <= 260 && Math.abs(o.y - b.y) <= 300);
      expect(nearFloor || nearRule || nearBlock).toBe(true);
    }
  });
});

describe("placeStars", () => {
  it("places up to the requested number of stars, spaced apart", () => {
    const { w, rules, floorY } = page();
    const { specials } = placeProps(w, rules, floorY, seeded(4));
    const nav = buildNav(w, specials);
    const stars = placeStars(w, nav, 12, seeded(5), 110);
    expect(stars).toHaveLength(12);
    for (const a of stars) for (const b of stars) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(110);
  });

  it("never puts a star over text or a prop", () => {
    const { w, rules, floorY } = page();
    const { specials, perches } = placeProps(w, rules, floorY, seeded(6));
    const nav = buildNav(w, specials);
    for (const s of placeStars(w, nav, 20, seeded(7), 80, perches)) {
      expect(isEmptyRect(w, s.x - 7, s.y - 7, 14, 14)).toBe(true);
    }
  });

  it("puts some stars on top of block structures", () => {
    const { w, rules, floorY } = page();
    const { specials, perches } = placeProps(w, rules, floorY, seeded(8));
    expect(perches.length).toBeGreaterThan(0);
    const nav = buildNav(w, specials);
    const stars = placeStars(w, nav, 10, seeded(9), 80, perches);
    expect(stars.some((s) => perches.some((p) => p.x === s.x && p.y - 12 === s.y))).toBe(true);
  });

});
