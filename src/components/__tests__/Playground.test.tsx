import { describe, it, expect, vi, afterEach } from "vitest";
import { wasReload } from "@/components/Playground";

const navigationOf = (type: string) =>
  vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ type } as unknown as PerformanceEntry]);

describe("wasReload", () => {
  afterEach(() => vi.restoreAllMocks());

  it("is true only when the page was loaded by reloading", () => {
    navigationOf("reload");
    expect(wasReload()).toBe(true);
    navigationOf("navigate");
    expect(wasReload()).toBe(false);
    navigationOf("back_forward");
    expect(wasReload()).toBe(false);
  });

  it("is false when the browser reports no navigation entry", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([]);
    expect(wasReload()).toBe(false);
  });
});
