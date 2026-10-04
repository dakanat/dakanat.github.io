import { describe, it, expect } from "vitest";
import { buildNav } from "@/lib/walker/nav";
import {
  placeBirds,
  placeCats,
  placeFireflies,
  updateBirds,
  updateCats,
  type Bird,
} from "@/lib/walker/decor";
import { HARD, ONEWAY, TEXT, cell, createWorld, fillRect, isEmptyRect, seeded } from "@/lib/walker/world";

/** Text lines with a one-way rule beside each, on the right. */
function world() {
  const w = createWorld(800, 2000);
  fillRect(w, 0, 1990, 800, 10, HARD);
  for (let y = 200; y < 1900; y += 300) {
    fillRect(w, 100, y, 300, 4, TEXT);
    fillRect(w, 450, y, 300, 2, ONEWAY);
  }
  return w;
}

const idleWalker = (x: number, y: number) => ({ x, y, ground: true, mode: "idle" });

describe("decor placement", () => {
  it("keeps fireflies in empty space", () => {
    const w = world();
    for (const f of placeFireflies(w, seeded(2), 2)) expect(isEmptyRect(w, f.cx - 40, f.cy - 30, 80, 60)).toBe(true);
  });

  it("seats cats and birds on rules, never on text", () => {
    const w = world();
    const nav = buildNav(w, []);
    const cats = placeCats(w, nav, seeded(3), 2);
    const birds = placeBirds(w, nav, seeded(4), 4, cats);
    expect(cats.length).toBeGreaterThan(0);
    expect(birds.length).toBeGreaterThan(0);
    for (const c of cats) expect(cell(w, c.x, c.y)).not.toBe(TEXT);
    for (const b of birds) expect(cell(w, b.homeX, b.homeY)).not.toBe(TEXT);
  });
});

describe("creature behaviour", () => {
  it("birds fly off when the walker comes close", () => {
    const bird: Bird = { homeX: 100, homeY: 100, x: 100, y: 100, vx: 0, vy: 0, flying: false, t: 5, face: 1 };
    updateBirds([bird], idleWalker(400, 100), 0.1, seeded(1));
    expect(bird.flying).toBe(false);
    updateBirds([bird], idleWalker(80, 100), 0.1, seeded(1));
    expect(bird.flying).toBe(true);
    expect(bird.vx).toBeGreaterThan(0); // away from the walker
  });

  it("a sitting cat watches the walker and shows a heart when it rests beside it", () => {
    const w = world();
    const cat = { x: 600, y: 200, face: 1, heart: 0, walking: false, t: 5, step: 0 };
    updateCats([cat], w, idleWalker(540, 200), 0.1, seeded(1));
    expect(cat.face).toBe(-1);
    expect(cat.heart).toBe(0);
    updateCats([cat], w, idleWalker(610, 200), 0.1, seeded(1));
    expect(cat.heart).toBeGreaterThan(0);
  });

  it("a cat strolls along its rule and turns back at the end", () => {
    const w = world();
    const cat = { x: 600, y: 200, face: 1, heart: 0, walking: true, t: 100, step: 0 };
    for (let i = 0; i < 200; i++) updateCats([cat], w, idleWalker(0, 0), 0.1, seeded(1));
    expect(cat.x).not.toBe(600);
    expect(cat.x).toBeGreaterThan(450);
    expect(cat.x).toBeLessThan(750);
  });
});
