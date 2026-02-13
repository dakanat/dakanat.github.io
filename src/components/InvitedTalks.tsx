import type { InvitedTalk } from "@/data/cv";
import Section from "./Section";
import { Mic } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export default function InvitedTalks({ t, invitedTalks }: { t: Dictionary; invitedTalks: InvitedTalk[] }) {
  return (
    <Section title={t.sections.invitedTalks} icon={Mic}>
      <ul className="space-y-3">
        {invitedTalks.map((talk) => (
          <li key={talk.title}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h3 className="font-semibold text-white">{talk.title}</h3>
              <span className="text-sm text-slate-500 font-mono">{talk.date}</span>
            </div>
            <p className="text-slate-400 italic mt-1">
              {talk.venue}{t.labels.in ? `, ${t.labels.in} ` : ", "}{talk.location}.
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
