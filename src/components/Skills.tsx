import type { SkillEntry } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Skills({ t, skills }: { t: Dictionary; skills: SkillEntry[] }) {
  const groups = [
    { label: t.skills.languages, items: skills.filter((s) => s.category === "language") },
    { label: t.skills.knowledge, items: skills.filter((s) => s.category === "knowledge") },
    { label: t.skills.infra, items: skills.filter((s) => s.category === "infra") },
  ].filter((g) => g.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <Section title={t.sections.skills}>
      {groups.map((g) => (
        <Row key={g.label} when={<span className="font-sans text-[14px]">{g.label}</span>}>
          <p>{g.items.map((s) => s.label).join(" · ")}</p>
        </Row>
      ))}
    </Section>
  );
}
