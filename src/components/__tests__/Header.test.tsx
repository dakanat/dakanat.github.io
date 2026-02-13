import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";
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
    expect(screen.getByText(/RESEARCHER/)).toBeInTheDocument();
  });

  it("renders email", () => {
    const profile = makeProfile({ email: "john@example.com" });
    render(<Header t={t} locale="en" profile={profile} />);
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders GitHub link with correct icon", () => {
    const profile = makeProfile({
      links: [{ label: "GitHub", url: "https://github.com/test" }],
    });
    render(<Header t={t} locale="en" profile={profile} />);
    const link = screen.getByText("[GitHub]").closest("a");
    expect(link).toHaveAttribute("href", "https://github.com/test");
    // SVG icon should be present
    expect(link?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders Google Scholar link", () => {
    const profile = makeProfile({
      links: [
        { label: "Google Scholar", url: "https://scholar.google.com/test" },
      ],
    });
    render(<Header t={t} locale="en" profile={profile} />);
    const link = screen.getByText("[Google Scholar]").closest("a");
    expect(link).toHaveAttribute("href", "https://scholar.google.com/test");
  });
});
