import type { CvData } from "@/data/cv";
import { citationsFor, statsDate, totalCitations } from "@/data/scholar";

const SITE = "https://dakanat.github.io";

/** Plain-text summary of the CV for AI agents, following the llms.txt convention. */
export function toLlmsTxt(cv: CvData): string {
  const p = cv.profile;
  const lines: string[] = [
    `# ${p.name}`,
    "",
    `> ${p.title}. Research interests: ${p.researchInterests}`,
    "",
    "## Pages",
    `- [CV (English)](${SITE}/en/)`,
    `- [CV (日本語)](${SITE}/ja/)`,
    `- [CV as JSON](${SITE}/cv.json): structured data for both languages`,
    "",
    "## Contact",
    `- Email: ${p.email}`,
    ...p.links.map((l) => `- [${l.label}](${l.url})`),
    "",
    "## Work Experience",
    ...cv.workExperience.flatMap((w) => [
      `- ${w.role}, ${w.organization} (${w.period})`,
      ...(w.responsibilities ?? []).map((r) => `  - ${r}`),
    ]),
    "",
    "## Publications",
    ...cv.publications.map((pub) => {
      const n = citationsFor(pub.title);
      return `- ${pub.authors}. "${pub.title}". ${pub.venue}, ${pub.year}. ${pub.links.map((l) => l.url).join(" ")}${n !== undefined ? ` (${n} citations)` : ""}`;
    }),
    `- Domestic conferences: ${cv.domesticConferences}`,
    ...(totalCitations() !== undefined ? [`- Total citations: ${totalCitations()} (Semantic Scholar, as of ${statsDate()})`] : []),
    "",
    "## Education",
    ...cv.education.map((e) => `- ${e.degree}, ${e.department}, ${e.school} (${e.period}). Advisor: ${e.advisors.map((a) => a.name).join(", ")}`),
    "",
    "## Awards",
    ...cv.awards.map((a) => `- ${a.title}, ${a.organization} (${a.year})`),
    "",
    "## Invited Talks",
    ...cv.invitedTalks.map((t) => `- "${t.title}", ${t.venue}, ${t.location} (${t.date})`),
    "",
    "## Funding",
    ...cv.funding.map((f) => `- ${f.title} (${f.period})${f.monthlyAmount ? `, ${f.monthlyAmount}` : ""}`),
    "",
    "## Skills",
    ...(
      [
        ["Languages & frameworks", "language"],
        ["Knowledge", "knowledge"],
        ["Cloud & infrastructure", "infra"],
      ] as const
    )
      .map(([label, cat]) => [label, cv.skills.filter((s) => s.category === cat).map((s) => s.label)] as const)
      .filter(([, items]) => items.length > 0)
      .map(([label, items]) => `- ${label}: ${items.join(", ")}`),
    "",
  ];
  return lines.join("\n");
}
