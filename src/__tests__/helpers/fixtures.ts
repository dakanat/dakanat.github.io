import type {
  Profile,
  EducationEntry,
  WorkEntry,
  Publication,
  AwardEntry,
  InvitedTalk,
  FundingEntry,
  SkillEntry,
} from "@/data/cv";
import type { Dictionary } from "@/i18n/dictionaries";

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    name: "Test User",
    title: "Test Title",
    email: "test@example.com",
    links: [
      { label: "GitHub", url: "https://github.com/test" },
      { label: "Google Scholar", url: "https://scholar.google.com/test" },
    ],
    researchInterests: "Machine Learning, NLP, Computer Vision.",
    ...overrides,
  };
}

export function makeEducation(
  overrides: Partial<EducationEntry> = {},
): EducationEntry {
  return {
    degree: "Ph.D. in Computer Science",
    period: "2020 – 2024",
    department: "Department of CS",
    school: "Test University",
    advisors: [{ name: "Prof. Smith", url: "https://example.com/smith" }],
    ...overrides,
  };
}

export function makeWorkEntry(overrides: Partial<WorkEntry> = {}): WorkEntry {
  return {
    role: "Research Assistant",
    period: "2020 – Present",
    organization: "Test Lab",
    ...overrides,
  };
}

export function makePublication(
  overrides: Partial<Publication> = {},
): Publication {
  return {
    myname: "Test User",
    authors: "Alice, Test User, Bob",
    title: "A Great Paper",
    venue: "ICML",
    year: 2023,
    links: [{ label: "PDF", url: "https://example.com/paper.pdf" }],
    ...overrides,
  };
}

export function makeAward(overrides: Partial<AwardEntry> = {}): AwardEntry {
  return {
    title: "Best Paper Award",
    organization: "ACM",
    year: "2023",
    ...overrides,
  };
}

export function makeInvitedTalk(
  overrides: Partial<InvitedTalk> = {},
): InvitedTalk {
  return {
    title: "Invited Talk Title",
    venue: "Conference X",
    location: "Tokyo, Japan",
    date: "2023-10",
    ...overrides,
  };
}

export function makeFunding(
  overrides: Partial<FundingEntry> = {},
): FundingEntry {
  return {
    title: "Research Grant",
    period: "2022 – 2024",
    ...overrides,
  };
}

export function makeSkill(overrides: Partial<SkillEntry> = {}): SkillEntry {
  return {
    label: "Python",
    value: 90,
    category: "language",
    ...overrides,
  };
}

export function makeDictionary(
  overrides: Partial<Dictionary> = {},
): Dictionary {
  return {
    sections: {
      education: "Education",
      workExperience: "Work Experience",
      publications: "Publications",
      awards: "Awards",
      invitedTalks: "Invited Talks",
      fundingSources: "Funding Sources",
    },
    publications: {
      international: "International",
      domestic: "Domestic",
    },
    labels: {
      advisor: "Advisor",
      and: "and",
      in: "in",
      class: "Class",
    },
    sidebar: {
      stats: "Stats",
      atcoder: "AtCoder",
      profile: "Profile",
      citations: "Citations",
      hIndex: "h-index",
      researchInterests: "Research Interests",
      skills: "Skills",
      skillLanguages: "Languages",
      skillKnowledge: "Knowledge",
      updated: "Updated",
    },
    footer: {
      copyright: "© 2024",
    },
    ...overrides,
  };
}
