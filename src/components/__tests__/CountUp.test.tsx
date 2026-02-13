import { describe, it, expect, vi, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import CountUp from "@/components/CountUp";

describe("CountUp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts at 0 when not intersecting", () => {
    const original = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "0px";
      thresholds = [0];
    } as unknown as typeof IntersectionObserver;

    const { container } = render(<CountUp value={100} />);
    expect(container.textContent).toBe("0");

    globalThis.IntersectionObserver = original;
  });

  it("displays target value after animation completes", async () => {
    // Replace rAF to capture and manually invoke callbacks
    const callbacks: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) => {
        callbacks.push(cb);
        return callbacks.length;
      },
    );

    const startTime = 1000;
    vi.spyOn(performance, "now").mockReturnValue(startTime);

    const { container } = render(<CountUp value={42} />);

    // IO mock fires synchronously during useEffect, which calls
    // performance.now() for start and schedules first rAF.
    // Now simulate rAF callbacks with time past DURATION_MS
    vi.spyOn(performance, "now").mockReturnValue(startTime + 1300);

    // Flush all pending rAF callbacks
    while (callbacks.length > 0) {
      const cb = callbacks.shift()!;
      act(() => {
        cb(startTime + 1300);
      });
    }

    expect(container.textContent).toBe("42");
  });

  it("applies className and style props", () => {
    const { container } = render(
      <CountUp value={10} className="test-class" style={{ color: "red" }} />,
    );
    const span = container.querySelector("span");
    expect(span).toHaveClass("test-class");
    expect(span?.style.color).toBe("red");
  });
});
