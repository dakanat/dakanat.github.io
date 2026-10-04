import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";
import stats from "@/data/stats.json";
import { makeDictionary, makeProfile } from "@/__tests__/helpers/fixtures";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const t = makeDictionary();

describe("Header", () => {
  it("renders profile name and title", () => {
    const profile = makeProfile({ name: "John Doe", title: "Researcher" });
    render(<Header t={t} locale="en" profile={profile} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Researcher")).toBeInTheDocument();
  });

  it("renders email", () => {
    const profile = makeProfile({ email: "john@example.com" });
    render(<Header t={t} locale="en" profile={profile} />);
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders research interests with their label", () => {
    const profile = makeProfile({ researchInterests: "Vision, Audio." });
    render(<Header t={t} locale="en" profile={profile} />);
    expect(screen.getByText(/Research Interests/)).toBeInTheDocument();
    expect(screen.getByText(/Vision, Audio\./)).toBeInTheDocument();
  });

  it("renders profile links", () => {
    const profile = makeProfile({
      links: [
        { label: "GitHub", url: "https://github.com/test" },
        { label: "Google Scholar", url: "https://scholar.google.com/test" },
      ],
    });
    render(<Header t={t} locale="en" profile={profile} />);
    expect(screen.getByText("GitHub").closest("a")).toHaveAttribute("href", "https://github.com/test");
    expect(screen.getByText("Google Scholar").closest("a")).toHaveAttribute(
      "href",
      "https://scholar.google.com/test",
    );
  });

  it("shows the AtCoder rating in its rating color next to the AtCoder link", () => {
    const profile = makeProfile({
      links: [{ label: "AtCoder", url: "https://atcoder.jp/users/test" }],
    });
    render(<Header t={t} locale="en" profile={profile} />);
    const rating = screen.getByText(String(stats.atcoder!.rating));
    expect(rating.style.color).not.toBe("");
  });
});

describe("Header citations", () => {
  it("shows total citations with Semantic Scholar named as the source", () => {
    render(<Header t={t} locale="en" profile={makeProfile()} />);
    const link = screen.getByText("Semantic Scholar").closest("a");
    expect(link).toHaveAttribute("href", expect.stringContaining("semanticscholar.org"));
    expect(screen.getByText(`${stats.scholar!.totalCitations} citations`)).toBeInTheDocument();
  });
});

describe("Header citations", () => {
  it("shows total citations with Semantic Scholar named as the source", () => {
    render(<Header t={t} locale="en" profile={makeProfile()} />);
    const link = screen.getByText("Semantic Scholar").closest("a");
    expect(link).toHaveAttribute("href", expect.stringContaining("semanticscholar.org"));
    expect(screen.getByText(`${stats.scholar!.totalCitations} citations`)).toBeInTheDocument();
  });
});

describe("Header hint", () => {
  it("explains near the top that clicking sends the walker there", () => {
    render(<Header t={t} locale="en" profile={makeProfile()} />);
    expect(screen.getByText(t.play.hint)).toBeInTheDocument();
  });
});

describe("Header PDF link", () => {
  it("opens the PDF for the current language in a new tab", () => {
    render(<Header t={t} locale="ja" profile={makeProfile()} />);
    const link = screen.getByText("PDF ↗").closest("a");
    expect(link).toHaveAttribute("href", "/cv-ja.pdf");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
