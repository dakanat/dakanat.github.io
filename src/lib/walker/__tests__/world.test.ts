import { describe, it, expect } from "vitest";
import { HARD, ONEWAY, TEXT, bodyFree, cell, createWorld, fillRect, isEmptyRect, seeded, topAt } from "@/lib/walker/world";

describe("world", () => {
  it("treats the left and right page edges as walls and the area above the page as empty", () => {
    const w = createWorld(100, 100);
    expect(cell(w, -1, 50)).toBe(HARD);
    expect(cell(w, 100, 50)).toBe(HARD);
    expect(cell(w, 50, -10)).toBe(0);
  });

  it("lets text above knee height pass through the body, but not text at the feet", () => {
    const w = createWorld(100, 100);
    fillRect(w, 0, 80, 100, 2, HARD); // ground
    fillRect(w, 40, 66, 20, 4, TEXT); // 10–14px above the feet: passes in front of the walker
    expect(bodyFree(w, 50, 80)).toBe(true);
    fillRect(w, 40, 74, 20, 4, TEXT); // within the knee zone
    expect(bodyFree(w, 50, 80)).toBe(false);
  });

  it("blocks the body on hard cells at any height", () => {
    const w = createWorld(100, 100);
    fillRect(w, 40, 68, 20, 2, HARD);
    expect(bodyFree(w, 50, 80)).toBe(false);
  });

  it("finds landing tops on one-way rules", () => {
    const w = createWorld(100, 100);
    fillRect(w, 0, 50, 100, 2, ONEWAY);
    expect(topAt(w, 50, 50)).toBe(true);
    expect(topAt(w, 50, 52)).toBe(false);
  });

  it("checks rectangles for emptiness, rejecting ones outside the world", () => {
    const w = createWorld(100, 100);
    fillRect(w, 10, 10, 4, 4, TEXT);
    expect(isEmptyRect(w, 20, 20, 10, 10)).toBe(true);
    expect(isEmptyRect(w, 8, 8, 10, 10)).toBe(false);
    expect(isEmptyRect(w, 95, 0, 10, 10)).toBe(false);
  });

  it("produces the same sequence for the same seed", () => {
    const a = seeded(7);
    const b = seeded(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
