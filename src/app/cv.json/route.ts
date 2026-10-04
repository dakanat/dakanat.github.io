import { getCvData } from "@/data/cv";
import stats from "@/data/stats.json";

export const dynamic = "force-static";

export async function GET() {
  const [en, ja] = await Promise.all([getCvData("en"), getCvData("ja")]);
  return Response.json({ en, ja, stats: { ...stats, citationSource: "Semantic Scholar (https://www.semanticscholar.org/)" } });
}
