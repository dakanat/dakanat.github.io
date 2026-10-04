import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";
import stats from "@/data/stats.json";
import { makeDictionary } from "@/__tests__/helpers/fixtures";

describe("Footer", () => {
  it("credits Semantic Scholar for citation counts, with the fetch date", () => {
    render(<Footer t={makeDictionary()} locale="en" />);
    expect(screen.getByText("Semantic Scholar").closest("a")).toHaveAttribute("href", "https://www.semanticscholar.org/");
    expect(screen.getByText(new RegExp(stats.fetchedAt.slice(0, 10)))).toBeInTheDocument();
  });

  it("renders the copyright", () => {
    render(<Footer t={makeDictionary()} locale="en" />);
    expect(screen.getByText("© 2024")).toBeInTheDocument();
  });

  it("prints the site address (shown only when printed)", () => {
    render(<Footer t={makeDictionary()} locale="ja" />);
    expect(screen.getByText("https://dakanat.github.io/ja/")).toHaveClass("print:block");
  });
});
