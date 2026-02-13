"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const locales = [
  { code: "en", label: "EN" },
  { code: "ja", label: "JP" },
] as const;

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center border border-slate-700 rounded-sm overflow-hidden">
      {locales.map(({ code, label }) => {
        const isActive = locale === code;
        const path = pathname.replace(`/${locale}`, `/${code}`);
        return isActive ? (
          <span
            key={code}
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-primary text-slate-900"
          >
            {label}
          </span>
        ) : (
          <Link
            key={code}
            href={path}
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 text-slate-400 hover:text-primary transition-colors"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
