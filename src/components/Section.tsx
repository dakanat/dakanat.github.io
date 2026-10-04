interface SectionProps {
  title: string;
  children: React.ReactNode;
}

/** A titled block whose top rule doubles as a one-way platform for the walker (data-ground). */
export default function Section({ title, children }: SectionProps) {
  return (
    <section data-ground className="border-t border-rule pt-5 print:pt-2.5">
      <h2 className="mb-5 text-[14px] tracking-[0.08em] text-muted print:mb-2 print:text-[9pt]">{title}</h2>
      <div className="flex flex-col gap-6 print:gap-2.5">{children}</div>
    </section>
  );
}

export function Row({
  when,
  current = false,
  children,
}: {
  when: React.ReactNode;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-6 gap-y-1 md:grid-cols-[9.5rem_1fr] print:grid-cols-[10.5rem_1fr]">
      <div
        className={`pt-[3px] font-mono text-[13px] md:whitespace-nowrap print:pt-0 print:text-[8.5pt] print:whitespace-nowrap ${current ? "font-semibold text-strong" : "text-muted"}`}
      >
        {when}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
