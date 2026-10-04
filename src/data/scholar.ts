import stats from "./stats.json";

export const SEMANTIC_SCHOLAR_AUTHOR_URL = "https://www.semanticscholar.org/author/2057512884";
export const SEMANTIC_SCHOLAR_URL = "https://www.semanticscholar.org/";

type Scholar = { totalCitations: number; papers: { title: string; citations: number }[] } | null;

const scholar = () => stats.scholar as Scholar;
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Total citations from Semantic Scholar (stats.json). */
export function totalCitations(): number | undefined {
  return scholar()?.totalCitations;
}

/** Citation count of one paper from Semantic Scholar, matched by title. */
export function citationsFor(title: string): number | undefined {
  return scholar()?.papers.find((p) => normalize(p.title) === normalize(title))?.citations;
}

/** When stats.json was fetched, as YYYY-MM-DD. */
export function statsDate(): string | undefined {
  return stats.fetchedAt ? stats.fetchedAt.slice(0, 10) : undefined;
}
