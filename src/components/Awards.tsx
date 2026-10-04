import type { AwardEntry } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Awards({ t, awards }: { t: Dictionary; awards: AwardEntry[] }) {
  return (
    <Section title={t.sections.awards}>
      {awards.map((award) => (
        <Row key={award.title} when={award.year}>
          <h3 className="font-semibold text-strong">{award.title}</h3>
          <p className="text-muted text-sm">{award.organization}</p>
        </Row>
      ))}
    </Section>
  );
}
