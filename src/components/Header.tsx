import type { Profile } from "@/data/cv";
import stats from "@/data/stats.json";
import { SEMANTIC_SCHOLAR_AUTHOR_URL, totalCitations } from "@/data/scholar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Dictionary } from "@/i18n/dictionaries";

// AtCoder rating colors, lightened where the official hue is unreadable on a dark background
export const ATCODER_COLOR_HEX: Record<string, string> = {
  gray: "#9a9a9a",
  brown: "#b0743c",
  green: "#3fae4f",
  cyan: "#00c0c0",
  blue: "#5a7bff",
  yellow: "#c8c800",
  orange: "#ff8c1a",
  red: "#ff4d4d",
};

export default function Header({
  t,
  locale,
  profile,
}: {
  t: Dictionary;
  locale: string;
  profile: Profile;
}) {
  const atcoder = stats.atcoder as { rating: number; color: string } | null;
  const citations = totalCitations();
  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[0.04em] whitespace-nowrap text-strong">
            {profile.name}
          </h1>
          <p className="mt-1 text-sm text-muted">{profile.title}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="print:hidden">
            <LanguageSwitcher locale={locale} />
          </div>
          <p className="hidden max-w-[11.5rem] text-right text-[12px] leading-snug text-muted motion-reduce:hidden print:hidden sm:block">
            {t.play.hint}
          </p>
        </div>
      </div>
      {/* on phones the hint gets its own line, so the name keeps one line in every language */}
      <p className="-mt-1 text-right text-[12px] leading-snug text-muted motion-reduce:hidden print:hidden sm:hidden">
        {t.play.hint}
      </p>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm">
          <span className="text-muted">{t.labels.researchInterests}: </span>
          {profile.researchInterests}
        </p>
        <a
          href={`/cv-${locale}.pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[13px] text-muted hover:text-fg print:hidden"
        >
          PDF ↗
        </a>
      </div>
      <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
        {profile.links.map((link) => (
          <li key={link.label}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
            {link.label === "AtCoder" && atcoder && (
              <span
                className="ml-1.5 font-mono font-medium"
                style={{ color: ATCODER_COLOR_HEX[atcoder.color] ?? ATCODER_COLOR_HEX.gray }}
              >
                {atcoder.rating}
              </span>
            )}
          </li>
        ))}
        {citations !== undefined && (
          <li>
            <a href={SEMANTIC_SCHOLAR_AUTHOR_URL} target="_blank" rel="noopener noreferrer">
              Semantic Scholar
            </a>
            <span className="ml-1.5 font-mono font-medium text-strong">
              {t.publications.citations.replace("{n}", String(citations))}
            </span>
          </li>
        )}
        <li className="font-mono text-[14px] text-muted">{profile.email}</li>
      </ul>
    </header>
  );
}
