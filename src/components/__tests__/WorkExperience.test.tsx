import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkExperience from "@/components/WorkExperience";
import { makeDictionary, makeWorkEntry } from "@/__tests__/helpers/fixtures";

const t = makeDictionary();

describe("WorkExperience", () => {
  it("renders role, period, and organization", () => {
    const entry = makeWorkEntry({
      role: "Software Engineer",
      period: "2022 – 2024",
      organization: "Acme Corp",
    });
    render(<WorkExperience t={t} workExperience={[entry]} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("2022 – 2024")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders responsibilities list when present", () => {
    const entry = makeWorkEntry({
      responsibilities: ["Task A", "Task B"],
    });
    render(<WorkExperience t={t} workExperience={[entry]} />);
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });

  it("does not render list when responsibilities is undefined", () => {
    const entry = makeWorkEntry({ responsibilities: undefined });
    const { container } = render(
      <WorkExperience t={t} workExperience={[entry]} />,
    );
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });
});
