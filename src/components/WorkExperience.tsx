import type { WorkEntry } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

const isCurrent = (period: string) => /現在|Present/.test(period);

export default function WorkExperience({ t, workExperience }: { t: Dictionary; workExperience: WorkEntry[] }) {
  return (
    <Section title={t.sections.workExperience}>
      {workExperience.map((entry) => (
        <Row key={entry.period} when={entry.period} current={isCurrent(entry.period)}>
          <h3 className="font-semibold text-strong">{entry.role}</h3>
          <p className="text-muted text-sm">{entry.organization}</p>
          {entry.responsibilities && (
            <ul className="mt-1.5 list-disc pl-5 marker:text-muted">
              {entry.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Row>
      ))}
    </Section>
  );
}
