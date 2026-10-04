import type { EducationEntry } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Education({ t, education }: { t: Dictionary; education: EducationEntry[] }) {
  return (
    <Section title={t.sections.education}>
      {education.map((entry) => (
        <Row key={entry.degree} when={entry.period}>
          <h3 className="font-semibold text-strong">{entry.degree}</h3>
          <p>{entry.department}</p>
          <p>{entry.school}</p>
          <p className="text-muted text-sm">
            {t.labels.advisor}:{" "}
            {entry.advisors.map((advisor, i) => (
              <span key={advisor.name}>
                {i > 0 && ` ${t.labels.and} `}
                <a href={advisor.url} target="_blank" rel="noopener noreferrer" className="text-fg">
                  {advisor.name}
                </a>
              </span>
            ))}
          </p>
        </Row>
      ))}
    </Section>
  );
}
