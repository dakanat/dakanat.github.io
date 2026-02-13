export type Dictionary = {
  sections: {
    education: string;
    workExperience: string;
    publications: string;
    awards: string;
    invitedTalks: string;
    fundingSources: string;
  };
  publications: {
    international: string;
    domestic: string;
  };
  labels: {
    advisor: string;
    and: string;
    in: string;
    class: string;
  };
  sidebar: {
    stats: string;
    atcoder: string;
    profile: string;
    citations: string;
    hIndex: string;
    researchInterests: string;
    skills: string;
    skillLanguages: string;
    skillKnowledge: string;
    updated: string;
  };
  footer: {
    copyright: string;
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
