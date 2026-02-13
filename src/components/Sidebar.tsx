import type { Profile, SkillEntry } from "@/data/cv";
import stats from "@/data/stats.json";
import { ExternalLink, Sparkles, BarChart3, Zap } from "lucide-react";
import CountUp from "@/components/CountUp";
import SkillBars from "@/components/SkillBars";
import SideSection from "@/components/SideSection";
import AnimatedSection from "@/components/AnimatedSection";
import type { Dictionary } from "@/i18n/dictionaries";

const ATCODER_COLOR_HEX: Record<string, string> = {
  gray: "#808080",
  brown: "#804000",
  green: "#008000",
  cyan: "#00C0C0",
  blue: "#0000FF",
  yellow: "#C0C000",
  orange: "#FF8000",
  red: "#FF0000",
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "\u2026" : str;
}

function StatsSection({ t, locale }: { t: Dictionary; locale: string }) {
  const atcoder = stats.atcoder as {
    rating: number;
    color: string;
    username: string;
  } | null;
  const scholar = stats.scholar as {
    totalCitations: number;
    hIndex: number;
    papers: { title: string; year: number; citations: number }[];
  } | null;

  if (!atcoder && !scholar) return null;

  const maxCitations = scholar
    ? Math.max(...scholar.papers.map((p) => p.citations), 1)
    : 1;

  return (
    <SideSection icon={BarChart3} title={t.sidebar.stats}>
      <div className="space-y-4">
        {/* AtCoder */}
        {atcoder && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.sidebar.atcoder}
              </div>
              <a
                href={`https://atcoder.jp/users/${atcoder.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {t.sidebar.profile}
              </a>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <CountUp
                value={atcoder.rating}
                className="text-2xl font-bold font-mono"
                style={{
                  color: ATCODER_COLOR_HEX[atcoder.color] || "#808080",
                }}
              />
              <span
                className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm"
                style={{
                  backgroundColor:
                    (ATCODER_COLOR_HEX[atcoder.color] || "#808080") + "22",
                  color: ATCODER_COLOR_HEX[atcoder.color] || "#808080",
                  border: `1px solid ${ATCODER_COLOR_HEX[atcoder.color] || "#808080"}44`,
                }}
              >
                {atcoder.color}
              </span>
            </div>
          </div>
        )}

        {/* Citations */}
        {scholar && (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.sidebar.citations}
              </div>
              <a
                href="https://www.semanticscholar.org/author/2057512884"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {t.sidebar.profile}
              </a>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <CountUp
                value={scholar.totalCitations}
                className="text-2xl font-bold font-mono text-white"
              />
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-primary/10 border border-primary/30 text-primary">
                {t.sidebar.hIndex} {scholar.hIndex}
              </span>
            </div>

            {/* Per-paper bar chart */}
            {scholar.papers.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {scholar.papers.map((paper) => (
                  <div key={paper.title} className="group">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span
                        className="text-slate-400 truncate mr-2"
                        title={paper.title}
                      >
                        {truncate(paper.title, 30)}
                        {paper.year ? ` (${paper.year})` : ""}
                      </span>
                      <span className="text-slate-300 font-mono shrink-0">
                        {paper.citations}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full"
                        style={{
                          width: `${Math.max((paper.citations / maxCitations) * 100, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 text-[10px] text-slate-500 text-right">
              Powered by{" "}
              <a
                href="https://www.semanticscholar.org/?utm_source=api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-primary transition-colors underline"
              >
                Semantic Scholar
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Fetched at */}
      {stats.fetchedAt && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
          {t.sidebar.updated}:{" "}
          {new Date(stats.fetchedAt).toLocaleDateString(
            locale === "ja" ? "ja-JP" : "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          )}
        </div>
      )}
    </SideSection>
  );
}

export default function Sidebar({
  t,
  locale,
  profile,
  skills,
}: {
  t: Dictionary;
  locale: string;
  profile: Profile;
  skills: SkillEntry[];
}) {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-6">
      {/* Stats */}
      <AnimatedSection delay={200}>
        <StatsSection t={t} locale={locale} />
      </AnimatedSection>

      {/* Skills */}
      {skills.length > 0 && (
        <AnimatedSection delay={300}>
          <SideSection icon={Zap} title={t.sidebar.skills}>
            <SkillBars
              skills={skills}
              labels={{
                languages: t.sidebar.skillLanguages,
                knowledge: t.sidebar.skillKnowledge,
              }}
            />
          </SideSection>
        </AnimatedSection>
      )}

      {/* Research Interests */}
      <AnimatedSection delay={400}>
        <SideSection icon={Sparkles} title={t.sidebar.researchInterests}>
          <div className="flex flex-wrap gap-2">
            {profile.researchInterests
              .replace(/\.$/, "")
              .split(",")
              .map((interest) => (
                <span
                  key={interest.trim()}
                  className="bg-primary/10 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider"
                >
                  {interest.trim()}
                </span>
              ))}
          </div>
        </SideSection>
      </AnimatedSection>
    </aside>
  );
}
