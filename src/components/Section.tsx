import type { LucideIcon } from "lucide-react";

interface SectionProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}

export default function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <section className="bg-bg-dark/90 border border-slate-700 p-1 rounded-sm transition-all animate-border-pulse">
      <div className="border border-slate-700/50 p-5 md:p-6">
        <h2 className="text-primary uppercase tracking-widest text-sm font-bold mb-4 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
