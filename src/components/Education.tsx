import type { EducationEntry } from "@/data/cv";
import Section from "./Section";
import { GraduationCap } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Education({ t, education }: { t: Dictionary; education: EducationEntry[] }) {
  return (
    <Section title={t.sections.education} icon={GraduationCap}>
      <div className="space-y-4">
        {education.map((entry) => (
          <div key={entry.degree}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h3 className="font-medium text-white">{entry.degree}</h3>
              <span className="text-sm text-slate-500 font-mono">
                {entry.period}
              </span>
            </div>
            <p className="text-slate-300 mt-1">{entry.department}</p>
            <p className="text-slate-300">{entry.school}</p>
            <p className="text-slate-400 text-sm mt-1">
              {t.labels.advisor}:{" "}
              {entry.advisors.map((advisor, i) => (
                <span key={advisor.name}>
                  {i > 0 && ` ${t.labels.and} `}
                  <a
                    href={advisor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-white transition-colors"
                  >
                    {advisor.name}
                  </a>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
