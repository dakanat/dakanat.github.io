import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AnimatedSection from "@/components/AnimatedSection";

describe("AnimatedSection", () => {
  it("renders children", () => {
    render(
      <AnimatedSection>
        <p>Hello World</p>
      </AnimatedSection>,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("sets opacity:1 and translateY(0) when IntersectionObserver fires", () => {
    const { container } = render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.opacity).toBe("1");
    expect(div.style.transform).toBe("translateY(0)");
  });

  it("applies transitionDelay from delay prop", () => {
    const { container } = render(
      <AnimatedSection delay={300}>
        <p>Content</p>
      </AnimatedSection>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.transitionDelay).toBe("300ms");
  });

  it("applies 0ms transitionDelay by default", () => {
    const { container } = render(
      <AnimatedSection>
        <p>Content</p>
      </AnimatedSection>,
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.transitionDelay).toBe("0ms");
  });
});
