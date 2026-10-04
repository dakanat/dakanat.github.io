import type { Dictionary } from "./dictionaries";

const ja: Dictionary = {
  sections: {
    education: "学歴",
    workExperience: "職歴",
    publications: "論文",
    awards: "受賞",
    invitedTalks: "招待講演",
    fundingSources: "研究資金",
    skills: "スキル",
  },
  publications: {
    international: "国際会議",
    domestic: "国内会議",
    citations: "被引用 {n}",
  },
  labels: {
    advisor: "指導教員",
    and: "・",
    in: "",
    researchInterests: "研究分野",
  },
  skills: {
    languages: "言語・フレームワーク",
    knowledge: "知識",
    infra: "クラウド・インフラ",
  },
  play: {
    hint: "Click to guide the stick figure.",
    stars: "集めた星",
    unlocked: "Chest unlocked ↓",
    thanks: "Thank you for your time.",
  },
  footer: {
    copyright: "© 2026 Daiki Tanaka. All Rights Reserved.",
    citationSource: "被引用数は {source} のデータです（{date} 時点）。",
  },
};

export default ja;
