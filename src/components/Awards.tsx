import type { AwardEntry } from "@/data/cv";
import Section from "./Section";
import { Award } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Awards({ t, awards }: { t: Dictionary; awards: AwardEntry[] }) {
  return (
    <Section title={t.sections.awards} icon={Award}>
      <ul className="space-y-3">
        {awards.map((award) => (
          <li key={award.title}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h3 className="font-medium text-white">{award.title}</h3>
              <span className="text-sm text-slate-500 font-mono">
                {award.year}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{award.organization}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
