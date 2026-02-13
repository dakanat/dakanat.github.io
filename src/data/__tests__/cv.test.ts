import { describe, it, expect } from "vitest";
import { getCvData } from "@/data/cv";
import type { CvData } from "@/data/cv";

describe("getCvData", () => {
  it('returns English data for "en"', async () => {
    const data = await getCvData("en");
    expect(data.profile.name).toBeTruthy();
    expect(typeof data.profile.email).toBe("string");
  });

  it('returns Japanese data for "ja"', async () => {
    const data = await getCvData("ja");
    expect(data.profile.name).toBeTruthy();
  });

  it("falls back to English for unknown locale", async () => {
    const enData = await getCvData("en");
    const frData = await getCvData("fr");
    expect(frData.profile.name).toBe(enData.profile.name);
  });

  it("returns all CvData fields", async () => {
    const data = await getCvData("en");
    const keys: (keyof CvData)[] = [
      "profile",
      "education",
      "workExperience",
      "publications",
      "domesticConferences",
      "awards",
      "invitedTalks",
      "funding",
      "skills",
    ];
    for (const key of keys) {
      expect(data).toHaveProperty(key);
    }
  });

  it('skills categories are only "language" or "knowledge"', async () => {
    const data = await getCvData("en");
    for (const skill of data.skills) {
      expect(["language", "knowledge"]).toContain(skill.category);
    }
  });

  it("skills values are in range 0–100", async () => {
    const data = await getCvData("en");
    for (const skill of data.skills) {
      expect(skill.value).toBeGreaterThanOrEqual(0);
      expect(skill.value).toBeLessThanOrEqual(100);
    }
  });
});
