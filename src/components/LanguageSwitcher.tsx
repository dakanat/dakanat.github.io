"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const locales = [
  { code: "ja", label: "JA" },
  { code: "en", label: "EN" },
] as const;

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 font-mono text-[13px]">
      {locales.map(({ code, label }, i) => {
        const isActive = locale === code;
        const path = pathname.replace(`/${locale}`, `/${code}`);
        return (
          <span key={code} className="flex items-center gap-2">
            {i > 0 && <span className="text-rule">/</span>}
            {isActive ? (
              <span className="text-strong" aria-current="true">
                {label}
              </span>
            ) : (
              <Link href={path} className="text-muted no-underline hover:text-fg">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
