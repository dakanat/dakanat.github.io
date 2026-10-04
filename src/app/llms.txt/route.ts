import { getCvData } from "@/data/cv";
import { toLlmsTxt } from "@/lib/cvText";

export const dynamic = "force-static";

export async function GET() {
  const cv = await getCvData("en");
  return new Response(toLlmsTxt(cv), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
