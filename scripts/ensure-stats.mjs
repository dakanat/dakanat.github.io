import { existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATS_PATH = join(__dirname, "..", "src", "data", "stats.json");

if (!existsSync(STATS_PATH)) {
  writeFileSync(STATS_PATH, JSON.stringify({ fetchedAt: "" }, null, 2) + "\n");
  console.log("Created stub stats.json");
}
