import type { FundingEntry } from "@/data/cv";
import Section from "./Section";
import { Banknote } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";

export default function Funding({ t, funding }: { t: Dictionary; funding: FundingEntry[] }) {
  return (
    <Section title={t.sections.fundingSources} icon={Banknote}>
      <div className="space-y-4">
        {funding.map((entry) => (
          <div key={entry.title}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
              <h3 className="font-medium text-white">{entry.title}</h3>
              <span className="text-sm text-slate-500 font-mono">{entry.period}</span>
            </div>
            {entry.monthlyAmount && (
              <p className="text-slate-400 text-sm mt-1">{entry.monthlyAmount}</p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
