import type { WorkEntry } from "@/data/cv";
import Section from "./Section";
import { Briefcase } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export default function WorkExperience({ t, workExperience }: { t: Dictionary; workExperience: WorkEntry[] }) {
  return (
    <Section title={t.sections.workExperience} icon={Briefcase}>
      <div className="space-y-4">
        {workExperience.map((entry) => (
          <div key={entry.period}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h3 className="font-medium text-white">{entry.role}</h3>
              <span className="text-sm text-slate-500 font-mono">
                {entry.period}
              </span>
            </div>
            <p className="text-slate-300 mt-1">{entry.organization}</p>
            {entry.responsibilities && (
              <ul className="mt-2 space-y-1">
                {entry.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-slate-400 text-sm"
                  >
                    <span className="text-primary mt-0.5">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
