import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Funding from "@/components/Funding";
import { makeDictionary, makeFunding } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("Funding", () => {
  it("renders title and period", () => {
    const entry = makeFunding({ title: "JSPS Grant", period: "2022 – 2024" });
    render(<Funding t={t} funding={[entry]} />);
    expect(screen.getByText("JSPS Grant")).toBeInTheDocument();
    expect(screen.getByText("2022 – 2024")).toBeInTheDocument();
  });

  it("renders monthlyAmount when present", () => {
    const entry = makeFunding({ monthlyAmount: "¥200,000/month" });
    render(<Funding t={t} funding={[entry]} />);
    expect(screen.getByText("¥200,000/month")).toBeInTheDocument();
  });

  it("does not render monthlyAmount when absent", () => {
    const entry = makeFunding({ monthlyAmount: undefined });
    render(<Funding t={t} funding={[entry]} />);
    expect(screen.queryByText(/month/)).not.toBeInTheDocument();
  });
});
