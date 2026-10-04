import type { InvitedTalk } from "@/data/cv";
import Section, { Row } from "./Section";
import type { Dictionary } from "@/i18n/dictionaries";

export default function InvitedTalks({ t, invitedTalks }: { t: Dictionary; invitedTalks: InvitedTalk[] }) {
  return (
    <Section title={t.sections.invitedTalks}>
      {invitedTalks.map((talk) => (
        <Row key={talk.title} when={talk.date}>
          <h3 className="font-semibold text-strong">{talk.title}</h3>
          <p className="text-muted text-sm italic">
            {talk.venue}
            {t.labels.in ? `, ${t.labels.in} ` : ", "}
            {talk.location}.
          </p>
        </Row>
      ))}
    </Section>
  );
}
