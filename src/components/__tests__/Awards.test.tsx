import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Awards from "@/components/Awards";
import { makeDictionary, makeAward } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("Awards", () => {
  it("renders award title, organization, and year", () => {
    const award = makeAward({
      title: "Outstanding Paper",
      organization: "IEEE",
      year: "2023",
    });
    render(<Awards t={t} awards={[award]} />);
    expect(screen.getByText("Outstanding Paper")).toBeInTheDocument();
    expect(screen.getByText("IEEE")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("renders multiple awards", () => {
    const awards = [
      makeAward({ title: "Award A" }),
      makeAward({ title: "Award B" }),
    ];
    render(<Awards t={t} awards={awards} />);
    expect(screen.getByText("Award A")).toBeInTheDocument();
    expect(screen.getByText("Award B")).toBeInTheDocument();
  });
});
