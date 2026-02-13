import { describe, it, expect } from "vitest";
import { getDictionary, locales } from "@/i18n/dictionaries";

describe("getDictionary", () => {
  it('returns English dictionary for "en"', async () => {
    const dict = await getDictionary("en");
    expect(dict.sections.education).toBeTruthy();
  });

  it('returns Japanese dictionary for "ja"', async () => {
    const dict = await getDictionary("ja");
    expect(dict.sections.education).toBeTruthy();
  });

  it("falls back to English for unknown locale", async () => {
    const enDict = await getDictionary("en");
    const frDict = await getDictionary("fr");
    expect(frDict.sections.education).toBe(enDict.sections.education);
  });

  it("English and Japanese dictionaries have the same key structure", async () => {
    const en = await getDictionary("en");
    const ja = await getDictionary("ja");

    function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
      return Object.entries(obj).flatMap(([k, v]) => {
        const key = prefix ? `${prefix}.${k}` : k;
        return typeof v === "object" && v !== null
          ? getKeys(v as Record<string, unknown>, key)
          : [key];
      });
    }

    expect(getKeys(en).sort()).toEqual(getKeys(ja).sort());
  });

  it('locales is ["ja", "en"]', () => {
    expect(locales).toEqual(["ja", "en"]);
  });
});
