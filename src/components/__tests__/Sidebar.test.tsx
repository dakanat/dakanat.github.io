import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  makeDictionary,
  makeProfile,
  makeSkill,
} from "@/__tests__/helpers/fixtures";

const mockStats = vi.hoisted(() => ({
  current: {
    fetchedAt: "2024-06-15T00:00:00.000Z",
    atcoder: { rating: 1200, color: "cyan", username: "testuser" } as
      | { rating: number; color: string; username: string }
      | undefined,
    scholar: {
      totalCitations: 100,
      hIndex: 5,
      papers: [
        { title: "Paper A", year: 2023, citations: 80 },
        { title: "Paper B", year: 2022, citations: 20 },
      ],
    } as
      | {
          totalCitations: number;
          hIndex: number;
          papers: { title: string; year: number; citations: number }[];
        }
      | undefined,
  },
}));

vi.mock("@/data/stats.json", () => {
  // Use a proxy so property access always reads from mockStats.current
  return {
    default: new Proxy(
      {},
      {
        get(_target, prop) {
          return mockStats.current[prop as keyof typeof mockStats.current];
        },
      },
    ),
  };
});

// Must import after mock setup
const { default: Sidebar } = await import("@/components/Sidebar");

const t = makeDictionary();

describe("StatsSection", () => {
  it("returns null when both atcoder and scholar are undefined", () => {
    const saved = { ...mockStats.current };
    mockStats.current.atcoder = undefined;
    mockStats.current.scholar = undefined;
    mockStats.current.fetchedAt = "";

    render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    expect(screen.queryByText("AtCoder")).not.toBeInTheDocument();
    expect(screen.queryByText("Citations")).not.toBeInTheDocument();

    // Restore
    Object.assign(mockStats.current, saved);
  });

  it("renders atcoder rating, color badge, and profile link", () => {
    render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    expect(screen.getByText("cyan")).toBeInTheDocument();
    const profileLinks = screen.getAllByText("Profile");
    expect(profileLinks.length).toBeGreaterThan(0);
    const atcoderLink = profileLinks[0].closest("a");
    expect(atcoderLink).toHaveAttribute(
      "href",
      "https://atcoder.jp/users/testuser",
    );
  });

  it("renders scholar citations, h-index, and paper bars", () => {
    render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    expect(screen.getByText(/h-index/)).toBeInTheDocument();
    expect(screen.getByText(/Paper A/)).toBeInTheDocument();
    expect(screen.getByText(/Paper B/)).toBeInTheDocument();
  });

  it("renders bar widths correctly based on max citations", () => {
    const { container } = render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    const bars = container.querySelectorAll(".bg-primary\\/70");
    const barStyles = Array.from(bars).map(
      (b) => (b as HTMLElement).style.width,
    );
    expect(barStyles).toContain("100%");
    expect(barStyles).toContain("25%");
  });

  it("renders fetchedAt date with locale formatting", () => {
    render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    expect(screen.getByText(/Jun/)).toBeInTheDocument();
  });
});

describe("Research Interests", () => {
  it("splits by comma and trims trailing period", () => {
    const profile = makeProfile({
      researchInterests: "Machine Learning, NLP, CV.",
    });
    render(
      <Sidebar t={t} locale="en" profile={profile} skills={[makeSkill()]} />,
    );
    expect(screen.getByText("Machine Learning")).toBeInTheDocument();
    expect(screen.getByText("NLP")).toBeInTheDocument();
    expect(screen.getByText("CV")).toBeInTheDocument();
    expect(screen.queryByText("CV.")).not.toBeInTheDocument();
  });
});

describe("ATCODER_COLOR_HEX", () => {
  it("applies known color hex to badge", () => {
    render(
      <Sidebar
        t={t}
        locale="en"
        profile={makeProfile()}
        skills={[makeSkill()]}
      />,
    );
    const badge = screen.getByText("cyan");
    // jsdom normalizes hex to rgb
    expect(badge.style.color).toBe("rgb(0, 192, 192)");
  });
});
