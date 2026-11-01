// Renders the built CV pages (out/) to PDF with headless Chrome: out/cv-ja.pdf and out/cv-en.pdf.
// Run after `pnpm build`. Chrome is taken from CHROME_PATH or the usual install locations
// (GitHub's ubuntu-latest runners ship Google Chrome).
import { createServer } from "node:http";
import { existsSync, readFileSync, renameSync, rmSync, statSync } from "node:fs";
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

// Rendering both pages takes seconds, so a hung Chrome (a stuck navigation, font load or
// print) should fail fast rather than wait out the CI job. Each step is bounded on its
// own, and the whole run by a deadline (BUILD_PDF_TIMEOUT_SECONDS, for slow machines).
const STEP_TIMEOUT_MS = 60_000;
const deadlineSeconds = Number(process.env.BUILD_PDF_TIMEOUT_SECONDS ?? 180);
if (!(deadlineSeconds > 0)) {
  throw new Error(`BUILD_PDF_TIMEOUT_SECONDS must be a positive number of seconds, got "${process.env.BUILD_PDF_TIMEOUT_SECONDS}"`);
}
const DEADLINE_MS = deadlineSeconds * 1000;

const server = await serve(OUT);
const { port } = server.address();
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  args: ["--no-sandbox"],
  // bounds every DevTools call, e.g. the page.evaluate on document.fonts.ready
  protocolTimeout: STEP_TIMEOUT_MS,
});

// Last resort if a step hangs anyway: kill Chrome and drop a half-written PDF (exiting
// skips the finally blocks below), then fail.
let pendingTmp;
setTimeout(() => {
  console.error(`build-pdf: not done after ${DEADLINE_MS / 1000}s, giving up`);
  browser.process()?.kill("SIGKILL");
  if (pendingTmp) rmSync(pendingTmp, { force: true });
  process.exit(1);
}, DEADLINE_MS).unref();

try {
  for (const locale of LOCALES) {
    const page = await browser.newPage();
    const file = join(OUT, `cv-${locale}.pdf`);
    // write next to the target and rename, so an interrupted run leaves no partial PDF
    const tmp = (pendingTmp = `${file}.tmp`);
    try {
      page.setDefaultTimeout(STEP_TIMEOUT_MS); // goto and pdf
      await page.emulateMediaType("print");
      // ?pdf keeps the stick figure layer from starting (see Playground.tsx)
      await page.goto(`http://127.0.0.1:${port}/${locale}/?pdf`, { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      // page size and margins come from the @page rule in globals.css
      await page.pdf({ path: tmp, printBackground: true, preferCSSPageSize: true });
      renameSync(tmp, file);
    } finally {
      rmSync(tmp, { force: true });
      pendingTmp = undefined;
      await page.close().catch(() => {});
    }
    console.log(`wrote ${file}`);
  }
} finally {
  // the PDFs are written by now; don't let a stuck shutdown hang or fail the run
  await Promise.race([
    browser.close(),
    new Promise((resolve) => setTimeout(resolve, 10_000).unref()),
  ]);
  browser.process()?.kill("SIGKILL");
  server.close();
}
