import { describe, it, expect } from "vitest";
import { ballistic, buildNav, findPath, jumpsFrom, nearestOnSeg, segAt } from "@/lib/walker/nav";
import { HARD, TEXT, createWorld, fillRect } from "@/lib/walker/world";

/** Floor at y=380 and a ledge 60px up, 40px to the right of the floor's open area. */
function level() {
  const w = createWorld(400, 400);
  fillRect(w, 0, 380, 400, 20, HARD);
  fillRect(w, 200, 320, 120, 4, TEXT);
  return w;
}

describe("navigation", () => {
  it("groups standable cells into separate surfaces", () => {
    const w = level();
    const nav = buildNav(w, []);
    const floor = segAt(w, nav, 50, 380);
    const ledge = segAt(w, nav, 250, 320);
    expect(floor).toBeGreaterThanOrEqual(0);
    expect(ledge).toBeGreaterThanOrEqual(0);
    expect(floor).not.toBe(ledge);
  });

  it("reaches a ledge by jumping", () => {
    const w = level();
    const nav = buildNav(w, []);
    const start = nearestOnSeg(nav, segAt(w, nav, 150, 380), 150)!;
    const goal = nearestOnSeg(nav, segAt(w, nav, 300, 320), 300)!;
    const path = findPath(w, nav, start, goal);
    expect(path.partial).toBe(false);
    expect(path.steps.some((s) => s.type === "jump")).toBe(true);
    expect(path.steps.at(-1)!.to).toBe(goal);
  });

  it("reaches a spot far above with a high jump when there is no ladder", () => {
    const w = createWorld(400, 600);
    fillRect(w, 0, 580, 400, 20, HARD);
    fillRect(w, 0, 300, 400, 2, 2);
    const nav = buildNav(w, []);
    const start = nearestOnSeg(nav, segAt(w, nav, 50, 580), 50)!;
    const goal = nearestOnSeg(nav, segAt(w, nav, 300, 300), 300)!;
    const path = findPath(w, nav, start, goal);
    expect(path.partial).toBe(false);
    expect(path.steps.some((s) => s.type === "jump")).toBe(true);
  });

  it("prefers a ladder over a very high jump", () => {
    const w = createWorld(400, 600);
    fillRect(w, 0, 580, 400, 20, HARD);
    fillRect(w, 0, 300, 400, 2, 2); // a one-way rule far above the floor
    const nav = buildNav(w, [{ kind: "ladder", x: 100, top: [100, 300], bottom: [100, 580] }]);
    const start = nearestOnSeg(nav, segAt(w, nav, 50, 580), 50)!;
    const goal = nearestOnSeg(nav, segAt(w, nav, 300, 300), 300)!;
    const path = findPath(w, nav, start, goal);
    expect(path.partial).toBe(false);
    expect(path.steps.some((s) => s.type === "ladder")).toBe(true);
  });


  it("flags a jump whose arc passes through a block, without ruling it out", () => {
    const w = level();
    expect(ballistic(w, 150, 380, 250, 320, true)!.clear).toBe(true);
    fillRect(w, 150, 292, 120, 4, HARD); // low enough to meet the head at the top of the arc
    const arc = ballistic(w, 150, 380, 250, 320, true);
    expect(arc).not.toBeNull();
    expect(arc!.clear).toBe(false);
  });

  it("refuses jumps beyond the jump range", () => {
    const w = level();
    expect(ballistic(w, 0, 380, 390, 380, true)).toBeNull();
  });

  it("bounces off a spring to reach a ledge", () => {
    const w = createWorld(400, 600);
    fillRect(w, 0, 580, 400, 20, HARD);
    fillRect(w, 100, 572, 14, 8, HARD); // the spring
    fillRect(w, 150, 430, 120, 2, 2);
    const nav = buildNav(w, [{ kind: "spring", top: [107, 572] }]);
    const springNode = nav.nodes.find((n) => n.spring)!;
    expect(springNode).toBeDefined();
    expect(jumpsFrom(w, nav, springNode).every((l) => l.type === "spring")).toBe(true);
    const goal = nearestOnSeg(nav, segAt(w, nav, 200, 430), 200)!;
    const path = findPath(w, nav, springNode, goal);
    expect(path.partial).toBe(false);
    expect(path.steps[0].type).toBe("spring");
  });

  it("drops down through a rule to the surface right below", () => {
    const w = createWorld(400, 600);
    fillRect(w, 0, 580, 400, 20, HARD);
    fillRect(w, 0, 200, 400, 2, 2); // rule
    fillRect(w, 0, 300, 400, 4, TEXT);
    const nav = buildNav(w, []);
    const onRule = nearestOnSeg(nav, segAt(w, nav, 200, 200), 200)!;
    const drop = onRule.links.find((l) => l.type === "drop");
    expect(drop).toBeDefined();
    expect(drop!.to.y).toBe(300);
  });

});
