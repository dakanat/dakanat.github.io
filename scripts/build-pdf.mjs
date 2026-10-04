// Renders the built CV pages (out/) to PDF with headless Chrome: out/cv-ja.pdf and out/cv-en.pdf.
// Run after `pnpm build`. Chrome is taken from CHROME_PATH or the usual install locations
// (GitHub's ubuntu-latest runners ship Google Chrome).
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "out");
const LOCALES = ["ja", "en"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.");
  return found;
}

/** Minimal static server for out/, resolving /path/ to /path/index.html. */
function serve(root) {
  const server = createServer((req, res) => {
    let path = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream" });
    res.end(readFileSync(path));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

if (!existsSync(OUT)) throw new Error("out/ not found: run `pnpm build` first.");
const server = await serve(OUT);
const { port } = server.address();
const browser = await puppeteer.launch({ executablePath: findChrome(), args: ["--no-sandbox"] });
try {
  for (const locale of LOCALES) {
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    // ?pdf keeps the stick figure layer from starting (see Playground.tsx)
    await page.goto(`http://127.0.0.1:${port}/${locale}/?pdf`, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const file = join(OUT, `cv-${locale}.pdf`);
    // page size and margins come from the @page rule in globals.css
    await page.pdf({ path: file, printBackground: true, preferCSSPageSize: true });
    console.log(`wrote ${file}`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
