import type { Dictionary } from "@/i18n/dictionaries";
import { SEMANTIC_SCHOLAR_URL, statsDate, totalCitations } from "@/data/scholar";

export default function Footer({ t, locale }: { t: Dictionary; locale: string }) {
  const date = statsDate();
  const [before, after] = t.footer.citationSource.replace("{date}", date ?? "").split("{source}");
  return (
    <footer data-ground className="border-t border-rule pt-5 text-center">
      {totalCitations() !== undefined && date && (
        <p className="text-muted text-[13px]">
          {before}
          <a href={SEMANTIC_SCHOLAR_URL} target="_blank" rel="noopener noreferrer">
            Semantic Scholar
          </a>
          {after}
        </p>
      )}
      <p className="mt-1 font-mono text-[12.5px] tracking-wider text-muted">{t.footer.copyright}</p>
      <p className="mt-1 hidden font-mono text-[12.5px] text-muted print:block">https://dakanat.github.io/{locale}/</p>
    </footer>
  );
}
