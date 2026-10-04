export type Dictionary = {
  sections: {
    education: string;
    workExperience: string;
    publications: string;
    awards: string;
    invitedTalks: string;
    fundingSources: string;
    skills: string;
  };
  publications: {
    international: string;
    domestic: string;
    /** "{n}" is replaced with the citation count */
    citations: string;
  };
  labels: {
    advisor: string;
    and: string;
    in: string;
    researchInterests: string;
  };
  skills: {
    languages: string;
    knowledge: string;
    infra: string;
  };
  play: {
    hint: string;
    stars: string;
    /** shown briefly when the last star is found */
    unlocked: string;
    /** shown briefly when the chest is opened */
    thanks: string;
  };
  footer: {
    copyright: string;
    /** "{source}" becomes a link to Semantic Scholar, "{date}" the date the counts were fetched */
    citationSource: string;
  };
};

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import("./en").then((m) => m.default),
  ja: () => import("./ja").then((m) => m.default),
};

export async function getDictionary(locale: string): Promise<Dictionary> {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return loader();
}

export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];

/** Japanese for visitors whose browser prefers Japanese, English for everyone else. */
export function pickLocale(languages: readonly string[]): Locale {
  return languages[0]?.toLowerCase().startsWith("ja") ? "ja" : "en";
}
