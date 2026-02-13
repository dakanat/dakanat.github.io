export interface Profile {
  name: string;
  title: string;
  email: string;
  links: { label: string; url: string }[];
  researchInterests: string;
}

export interface EducationEntry {
  degree: string;
  period: string;
  department: string;
  school: string;
  advisors: { name: string; url: string }[];
}

export interface WorkEntry {
  role: string;
  period: string;
  organization: string;
  responsibilities?: string[];
}

export interface Publication {
  myname: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  links: { label: string; url: string }[];
}

export interface AwardEntry {
  title: string;
  organization: string;
  year: string;
}

export interface InvitedTalk {
  title: string;
  venue: string;
  location: string;
  date: string;
}

export interface FundingEntry {
  title: string;
  period: string;
  monthlyAmount?: string;
}

export interface SkillEntry {
  label: string;
  value: number;
  category: "language" | "knowledge";
}

export interface CvData {
  profile: Profile;
  education: EducationEntry[];
  workExperience: WorkEntry[];
  publications: Publication[];
  domesticConferences: string;
  awards: AwardEntry[];
  invitedTalks: InvitedTalk[];
  funding: FundingEntry[];
  skills: SkillEntry[];
}

const modules: Record<string, () => Promise<{ default: CvData }>> = {
  en: () => import("./cv.en"),
  ja: () => import("./cv.ja"),
};

export async function getCvData(locale: string): Promise<CvData> {
  const load = modules[locale] ?? modules.en;
  const mod = await load();
  return mod.default;
}
