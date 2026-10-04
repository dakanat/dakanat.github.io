import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/some/page",
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

import LanguageSwitcher from "@/components/LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders active locale as span (not a link)", () => {
    render(<LanguageSwitcher locale="en" />);
    const en = screen.getByText("EN");
    expect(en.tagName).toBe("SPAN");
  });

  it("renders non-active locale as a link", () => {
    render(<LanguageSwitcher locale="en" />);
    const ja = screen.getByText("JA");
    expect(ja.tagName).toBe("A");
  });

  it("replaces locale segment in the URL", () => {
    render(<LanguageSwitcher locale="en" />);
    const ja = screen.getByText("JA");
    expect(ja).toHaveAttribute("href", "/ja/some/page");
  });
});
