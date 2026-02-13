import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SetLang from "@/components/SetLang";

describe("SetLang", () => {
  it("sets document.documentElement.lang to locale", () => {
    render(<SetLang locale="ja" />);
    expect(document.documentElement.lang).toBe("ja");
  });

  it("updates lang when locale changes", () => {
    const { rerender } = render(<SetLang locale="ja" />);
    expect(document.documentElement.lang).toBe("ja");

    rerender(<SetLang locale="en" />);
    expect(document.documentElement.lang).toBe("en");
  });
});
