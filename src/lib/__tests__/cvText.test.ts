import { describe, it, expect } from "vitest";
import { getCvData } from "@/data/cv";
import { toLlmsTxt } from "@/lib/cvText";

describe("toLlmsTxt", () => {
  it("starts with the name as the title and a one-line summary", async () => {
    const text = toLlmsTxt(await getCvData("en"));
    const [title, , summary] = text.split("\n");
    expect(title).toBe("# Daiki Tanaka");
    expect(summary.startsWith("> ")).toBe(true);
  });

  it("includes every section of the CV", async () => {
    const cv = await getCvData("en");
    const text = toLlmsTxt(cv);
    for (const heading of ["Work Experience", "Publications", "Education", "Awards", "Invited Talks", "Funding", "Skills"]) {
      expect(text).toContain(`## ${heading}`);
    }
    for (const w of cv.workExperience) expect(text).toContain(w.organization);
    expect(text).toContain(cv.publications[0].title);
  });

  it("credits Semantic Scholar for citation counts and lists advisors and skill groups", async () => {
    const text = toLlmsTxt(await getCvData("en"));
    expect(text).toMatch(/Total citations: \d+ \(Semantic Scholar, as of \d{4}-\d{2}-\d{2}\)/);
    expect(text).toMatch(/\(\d+ citations\)/);
    expect(text).toContain("Advisor: Prof. Kiyoharu Aizawa");
    expect(text).toContain("- Cloud & infrastructure: AWS, GCP, Azure, Docker, Terraform");
  });
});
