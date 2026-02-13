import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Publications from "@/components/Publications";
import { makeDictionary, makePublication } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("RichMyName highlighting", () => {
  it("highlights author name in the middle of the string", () => {
    const pub = makePublication({
      authors: "Alice, Test User, Bob",
      myname: "Test User",
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Some text"
      />,
    );
    const strong = screen.getByText("Test User");
    expect(strong.tagName).toBe("STRONG");
    expect(strong.parentElement?.tagName).toBe("U");
  });

  it("highlights author name at the beginning", () => {
    const pub = makePublication({
      authors: "Test User, Alice, Bob",
      myname: "Test User",
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Some text"
      />,
    );
    const strong = screen.getByText("Test User");
    expect(strong.tagName).toBe("STRONG");
  });

  it("highlights author name at the end", () => {
    const pub = makePublication({
      authors: "Alice, Bob, Test User",
      myname: "Test User",
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Some text"
      />,
    );
    const strong = screen.getByText("Test User");
    expect(strong.tagName).toBe("STRONG");
  });

  it("highlights multiple occurrences", () => {
    const pub = makePublication({
      authors: "Test User and Test User",
      myname: "Test User",
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Some text"
      />,
    );
    const strongs = screen.getAllByText("Test User");
    expect(strongs).toHaveLength(2);
    for (const el of strongs) {
      expect(el.tagName).toBe("STRONG");
    }
  });

  it("renders plain text when name is not found", () => {
    const pub = makePublication({
      authors: "Alice, Bob",
      myname: "Nobody",
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Some text"
      />,
    );
    expect(screen.getByText("Alice, Bob")).toBeInTheDocument();
    expect(screen.queryByText("Nobody")).not.toBeInTheDocument();
  });
});

describe("Publications component", () => {
  it("renders title, venue, and year", () => {
    const pub = makePublication({
      title: "My Paper",
      venue: "NeurIPS",
      year: 2024,
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Domestic text"
      />,
    );
    expect(screen.getByText("My Paper")).toBeInTheDocument();
    expect(screen.getByText(/NeurIPS, 2024\./)).toBeInTheDocument();
  });

  it("renders links with correct attributes", () => {
    const pub = makePublication({
      links: [{ label: "PDF", url: "https://example.com/paper.pdf" }],
    });
    render(
      <Publications
        t={t}
        publications={[pub]}
        domesticConferences="Domestic text"
      />,
    );
    const link = screen.getByText("[PDF]");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("href", "https://example.com/paper.pdf");
  });

  it("renders domestic conferences text", () => {
    render(
      <Publications
        t={t}
        publications={[]}
        domesticConferences="Domestic conf text here"
      />,
    );
    expect(screen.getByText("Domestic conf text here")).toBeInTheDocument();
  });
});
