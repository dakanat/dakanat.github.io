# CV Site – dakanat.github.io

## Dev Commands

```bash
pnpm dev         # Start dev server at localhost:3000
pnpm build       # Static export to out/
pnpm lint        # Run ESLint
pnpm test        # Run Vitest in watch mode
pnpm test:run    # Run tests once (CI)
pnpm fetch-stats # Fetch AtCoder & Scholar stats → stats.json
pnpm build:pdf   # Render out/cv-{ja,en}.pdf from the built site (run after build; needs Chrome)
```

## Architecture

- **Framework:** Next.js 16 (App Router) with static export
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest + React Testing Library (jsdom)
- **Package manager:** pnpm (via corepack)
- **Node version:** 22 LTS (pinned via mise)
- **CI/CD:** GitHub Actions → GitHub Pages

## i18n

- Locales: `ja` (default), `en`
- Routing: `/[locale]/` dynamic segment (`src/app/[locale]/`)
- UI translations: `src/i18n/{ja,en}.ts` loaded via `getDictionary(locale)`
- CV data per locale: `src/data/cv.{ja,en}.ts`
- Root `/` sends Japanese-language browsers to `/ja/` and everyone else to `/en/` (client-side, `pickLocale`)

## Key Files

| Path | Description |
|------|-------------|
| `src/app/[locale]/page.tsx` | Main CV page (server component) |
| `src/app/[locale]/layout.tsx` | Locale layout (sets `<html lang>`) |
| `src/app/layout.tsx` | Root layout (IBM Plex Sans JP / Mono, dark) |
| `src/app/page.tsx` | Root: picks `/ja/` or `/en/` from the browser language |
| `src/components/` | Section components (Header, Education, etc.), timeline `Section`/`Row` |
| `src/components/Playground.tsx` | Stick-figure layer (canvases, star counter, tap-to-go) |
| `src/lib/walker/` | Walker engine: `world` (collision map), `dom` (rasterizes rendered glyphs), `nav` (surfaces + pathfinding), `props` (ladders/pipes/blocks/stars), `walker` (behaviour), `render`, `engine` |
| `src/lib/cvText.ts` | CV → llms.txt text |
| `src/app/{llms.txt,cv.json}/route.ts` | Static `/llms.txt` and `/cv.json` for AI agents |
| `src/data/cv.ts` | CV types & locale-based loader |
| `src/data/cv.{ja,en}.ts` | CV content per locale |
| `src/i18n/dictionaries.ts` | Dictionary type & async loader |
| `src/i18n/{ja,en}.ts` | UI translations per locale |
| `src/data/stats.json` | AtCoder/Scholar stats (committed, updated via `pnpm fetch-stats`) |
| `scripts/fetch-stats.mjs` | Fetches AtCoder & Semantic Scholar metrics |
| `scripts/build-pdf.mjs` | Prints the built CV pages to PDF with headless Chrome (print CSS in `globals.css`) |
| `next.config.ts` | Next.js config (static export, trailing slashes) |
| `vitest.config.ts` | Vitest config (jsdom, React plugin, `@` alias) |
| `.github/workflows/deploy.yml` | CI: `refresh-stats` (monthly/manual: fetch + commit stats.json, the only job with write access) → `build-and-deploy`: lint → test → fetch-stats → build → build:pdf → deploy |

## Testing

- Config: `vitest.config.ts`, setup in `src/__tests__/setup.ts`
- Tests live alongside source: `src/{components,data,i18n,lib}/__tests__/`
- Fixtures: `src/__tests__/helpers/fixtures.ts`
- Run `pnpm test:run` before pushing
