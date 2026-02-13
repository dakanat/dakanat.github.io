import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillBars from "@/components/SkillBars";
import { makeSkill } from "@/__tests__/helpers/fixtures";

const labels = { languages: "Languages", knowledge: "Knowledge" };

describe("SkillBars", () => {
  it("separates skills by category", () => {
    const skills = [
      makeSkill({ label: "Python", category: "language" }),
      makeSkill({ label: "ML", category: "knowledge" }),
    ];
    render(<SkillBars skills={skills} labels={labels} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("ML")).toBeInTheDocument();
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Knowledge")).toBeInTheDocument();
  });

  it("hides knowledge section when only language skills exist", () => {
    const skills = [makeSkill({ label: "Python", category: "language" })];
    render(<SkillBars skills={skills} labels={labels} />);
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.queryByText("Knowledge")).not.toBeInTheDocument();
  });

  it("hides language section when only knowledge skills exist", () => {
    const skills = [makeSkill({ label: "ML", category: "knowledge" })];
    render(<SkillBars skills={skills} labels={labels} />);
    expect(screen.queryByText("Languages")).not.toBeInTheDocument();
    expect(screen.getByText("Knowledge")).toBeInTheDocument();
  });

  it("sets bar width to skill.value% when IntersectionObserver fires", () => {
    const skills = [makeSkill({ label: "Python", value: 85 })];
    const { container } = render(<SkillBars skills={skills} labels={labels} />);
    const bar = container.querySelector(".bg-primary\\/70") as HTMLElement;
    expect(bar.style.width).toBe("85%");
  });

  it("sets bar width to 0% when IntersectionObserver has not fired", () => {
    // Override IntersectionObserver to NOT fire
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

    const skills = [makeSkill({ label: "Python", value: 85 })];
    const { container } = render(<SkillBars skills={skills} labels={labels} />);
    const bar = container.querySelector(".bg-primary\\/70") as HTMLElement;
    expect(bar.style.width).toBe("0%");

    globalThis.IntersectionObserver = original;
  });
});
