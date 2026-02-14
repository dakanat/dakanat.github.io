import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default function SideSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-bg-dark border border-slate-700 rounded-sm p-1 animate-border-pulse transition-all">
      <div className="bg-slate-900/50 p-5 md:p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
