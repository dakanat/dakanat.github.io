import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "..", "src", "data", "stats.json");

const ATCODER_URL = "https://atcoder.jp/users/akanat/history/json";
const SCHOLAR_AUTHOR_URL =
  "https://api.semanticscholar.org/graph/v1/author/2057512884?fields=name,citationCount,hIndex,paperCount";
const SCHOLAR_PAPERS_URL =
  "https://api.semanticscholar.org/graph/v1/author/2057512884/papers?fields=title,year,citationCount";

function getAtcoderColor(rating) {
  if (rating < 400) return "gray";
  if (rating < 800) return "brown";
  if (rating < 1200) return "green";
  if (rating < 1600) return "cyan";
  if (rating < 2000) return "blue";
  if (rating < 2400) return "yellow";
  if (rating < 2800) return "orange";
  return "red";
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json();
}

async function fetchAtcoder() {
  const history = await fetchJson(ATCODER_URL);
  if (!Array.isArray(history) || history.length === 0) {
    throw new Error("Empty AtCoder history");
  }
  const latest = history[history.length - 1];
  const rating = latest.NewRating;
  return { rating, color: getAtcoderColor(rating), username: "akanat" };
}

async function fetchScholar() {
  const [author, papersRes] = await Promise.all([
    fetchJson(SCHOLAR_AUTHOR_URL),
    fetchJson(SCHOLAR_PAPERS_URL),
  ]);
  const papers = (papersRes.data || [])
    .filter((p) => p.citationCount > 0 || p.year)
    .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
    .map((p) => ({
      title: p.title,
      year: p.year,
      citations: p.citationCount || 0,
    }));
  return {
    totalCitations: author.citationCount || 0,
    hIndex: author.hIndex || 0,
    papers,
  };
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const DEFAULT_STATS = {
  fetchedAt: "",
  atcoder: null,
  scholar: null,
};

async function main() {
  console.log("Fetching stats...");
  let stats = { ...DEFAULT_STATS };

  // Load existing stats as fallback
  if (existsSync(OUTPUT_PATH)) {
    try {
      stats = { ...DEFAULT_STATS, ...JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) };
    } catch {}
  }

  // Skip fetch if last fetch was less than 1 day ago
  if (stats.fetchedAt) {
    const elapsed = Date.now() - new Date(stats.fetchedAt).getTime();
    if (elapsed < ONE_DAY_MS) {
      console.log(
        `  Last fetched ${Math.round(elapsed / 3600000)}h ago — skipping (< 24h)`
      );
      return;
    }
  }

  let atcoderOk = false;
  let scholarOk = false;

  try {
    stats.atcoder = await fetchAtcoder();
    atcoderOk = true;
    console.log(`  AtCoder rating: ${stats.atcoder.rating} (${stats.atcoder.color})`);
  } catch (err) {
    console.warn(`  AtCoder fetch failed: ${err.message}, using fallback`);
  }

  try {
    stats.scholar = await fetchScholar();
    scholarOk = true;
    console.log(`  Scholar citations: ${stats.scholar.totalCitations}, h-index: ${stats.scholar.hIndex}`);
  } catch (err) {
    console.warn(`  Scholar fetch failed: ${err.message}, using fallback`);
  }

  if (atcoderOk && scholarOk) {
    stats.fetchedAt = new Date().toISOString();
    const json = JSON.stringify(stats, null, 2) + "\n";
    writeFileSync(OUTPUT_PATH, json);
    console.log(`Stats written to stats.json`);
  } else {
    console.warn(`Skipped writing — partial fetch (existing stats.json unchanged)`);
  }
}

main().catch((err) => {
  console.error("Fatal error fetching stats:", err);
});
