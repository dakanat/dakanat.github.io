import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Skills from "@/components/Skills";
import { makeDictionary, makeSkill } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("Skills", () => {
  it("lists skill names grouped by category, without scores", () => {
    const skills = [
      makeSkill({ label: "Python", category: "language" }),
      makeSkill({ label: "C++", category: "language" }),
      makeSkill({ label: "Computer Vision", category: "knowledge" }),
      makeSkill({ label: "AWS", category: "infra" }),
      makeSkill({ label: "Docker", category: "infra" }),
    ];
    const { container } = render(<Skills t={t} skills={skills} />);
    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Python · C++")).toBeInTheDocument();
    expect(screen.getByText("Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Computer Vision")).toBeInTheDocument();
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("AWS · Docker")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\d{2}/);
  });

  it("omits an empty category", () => {
    render(<Skills t={t} skills={[makeSkill({ category: "language" })]} />);
    expect(screen.queryByText("Knowledge")).not.toBeInTheDocument();
  });

  it("renders nothing without skills", () => {
    const { container } = render(<Skills t={t} skills={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
