import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Education from "@/components/Education";
import { makeDictionary, makeEducation } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("Education", () => {
  it("renders degree, department, school, and period", () => {
    const entry = makeEducation({
      degree: "M.Sc.",
      department: "CS Dept",
      school: "MIT",
      period: "2020 – 2022",
    });
    render(<Education t={t} education={[entry]} />);
    expect(screen.getByText("M.Sc.")).toBeInTheDocument();
    expect(screen.getByText("CS Dept")).toBeInTheDocument();
    expect(screen.getByText("MIT")).toBeInTheDocument();
    expect(screen.getByText("2020 – 2022")).toBeInTheDocument();
  });

  it("renders advisor with link", () => {
    const entry = makeEducation({
      advisors: [{ name: "Prof. X", url: "https://example.com/x" }],
    });
    render(<Education t={t} education={[entry]} />);
    const link = screen.getByText("Prof. X");
    expect(link.closest("a")).toHaveAttribute("href", "https://example.com/x");
  });

  it('renders "and" separator between multiple advisors', () => {
    const entry = makeEducation({
      advisors: [
        { name: "Prof. A", url: "https://a.com" },
        { name: "Prof. B", url: "https://b.com" },
      ],
    });
    render(<Education t={t} education={[entry]} />);
    expect(screen.getByText("Prof. A")).toBeInTheDocument();
    expect(screen.getByText("Prof. B")).toBeInTheDocument();
    expect(screen.getByText(/and/)).toBeInTheDocument();
  });
});
