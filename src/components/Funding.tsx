import type { FundingEntry } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Funding({ t, funding }: { t: Dictionary; funding: FundingEntry[] }) {
  return (
    <Section title={t.sections.fundingSources}>
      {funding.map((entry) => (
        <Row key={entry.title} when={entry.period}>
          <h3 className="font-semibold text-strong">{entry.title}</h3>
          {entry.monthlyAmount && <p className="text-muted text-sm">{entry.monthlyAmount}</p>}
        </Row>
      ))}
    </Section>
  );
}
