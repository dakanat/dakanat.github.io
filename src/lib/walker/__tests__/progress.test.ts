import { describe, it, expect } from "vitest";
import { STAR_COUNT, normalizeProgress } from "@/lib/walker/engine";

describe("normalizeProgress", () => {
  it("keeps a finished game opened", () => {
    expect(normalizeProgress({ taken: STAR_COUNT, opened: true })).toEqual({ taken: STAR_COUNT, opened: true });
  });

  it("relocks the chest when fewer stars than required were found (e.g. after the star count is raised)", () => {
    expect(normalizeProgress({ taken: STAR_COUNT - 1, opened: true })).toEqual({ taken: STAR_COUNT - 1, opened: false });
  });

  it("clamps the star count and survives missing or malformed data", () => {
    expect(normalizeProgress({ taken: 99, opened: false })).toEqual({ taken: STAR_COUNT, opened: false });
    expect(normalizeProgress({ taken: -3, opened: true })).toEqual({ taken: 0, opened: false });
    expect(normalizeProgress(undefined)).toEqual({ taken: 0, opened: false });
    expect(normalizeProgress(null)).toEqual({ taken: 0, opened: false });
  });
});
