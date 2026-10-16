# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Showcase site (UI text in Spanish) that recreates terminal configurations (Kitty, WezTerm, Windows Terminal…) purely in HTML/CSS, plus a "Lab" where visitors compose their own terminal and export the config. Built with **Astro 7 + TypeScript (strict)**, deployed to Vercel. The pre-migration static version is preserved at git tag `v0-static`.

The migration plan (backend for saved Lab designs, tests, CI, Vercel) lives in `/home/naelsherin/.claude/plans/quiero-que-sea-una-functional-kahan.md`.

## Commands

```bash
npm run dev            # dev server on http://localhost:4321
npm run build          # production build (Vercel output in .vercel/output)
npm run check          # astro check (typecheck .astro + .ts)
npm run lint           # ESLint (flat config, typescript-eslint + eslint-plugin-astro)
npm run format         # Prettier --write (format:check in CI); src/data/ is excluded on purpose
npm test               # Vitest: unit + API tests against an in-memory SQLite
npm run test:e2e       # Playwright (desktop + mobile Chromium); starts its own dev server on :4323 with e2e.db
npm run db:migrate     # apply drizzle/ migrations (local: creates/updates local.db)
npm run db:generate    # create a new migration after editing src/db/schema.ts
npx vitest run src/lib/export.test.ts      # one unit test file
npx playwright test -g "enlace corto"      # one e2e test by name
```

Requires Node 24 (`.nvmrc`). TypeScript is pinned to 6.x because `astro check` and typescript-eslint do not support TS 7 yet. Run `npm run db:migrate` once before `npm run dev`. `astro preview` does not work with the Vercel adapter; use `npm run dev` to exercise API routes.

Astro 7 auto-backgrounds `astro dev` when it detects an AI agent (stop it with `npx astro dev stop`); `--ignore-lock` forces the foreground, which is why the Playwright `webServer` uses it.

CI (`.github/workflows/ci.yml`) runs on every PR and push to `main`: lint → format:check → check → test → build, and Playwright in a parallel job (report uploaded on failure).

## Testing notes

- Never put test files under `src/pages/`: Astro turns every `.ts` there into a public route. API tests live in `src/test/` and mock `src/db/client` (which reads `astro:env`) with an in-memory DB from `src/test/db.ts` (`createTestDb`, runs the real migrations).
- `src/db/connect.ts` (`createDb`) is the env-free connection factory; `src/db/client.ts` is the app instance.
- E2E tests import `test`/`expect` from `tests/e2e/fixtures.ts`, whose auto fixture fails a test on any uncaught page error.

## Architecture

Content is rendered **at build time**; the browser only gets a small JS bundle for interactivity.

- `src/data/` — all content. `setups.ts` (`SETUPS: Setup[]`, `VIBES`, and the shared prompt builders like `guyenTop`), `lab.ts` (`THEMES` with 16 ANSI colors, `FONTS`, `PROMPTS`, `CURSORS`, `SIZE`, `EXPORT_FORMATS`). Adding a setup = one object in `SETUPS`; index, filters, counts, command palette and J/K navigation all derive from it.
- `src/lib/` — pure, isomorphic helpers (usable in build and browser, unit-testable):
  - `term.ts`: `c/b/it(colorKey, text)` build colored spans (escaped via `esc`), `segs/roundSegs/segsR` powerline segments, `renderLines`, `highlight`. A color key is a palette variable name (`'green'` → `var(--green)`) or a literal `#hex`.
  - `design.ts`: the `Design` type (theme/font/prompt/cursor/size), `DEFAULT_DESIGN`, `normalizeDesign` (validates unknown input, falls back to defaults), query-param (de)serialization.
  - `export.ts`: `exportConfig(design, fmt)` → kitty.conf / alacritty.toml / ghostty text.
  - `fuzzy.ts`: command-palette matching (accent/case-insensitive, in-order letters).
- `src/components/` — `Home.astro` composes the page (Nav = fixed topbar, Hero, Index, Setup ×N, Lab, Footer, CommandPalette) and accepts an optional `design` prop that preloads the Lab. Each terminal's `palette` becomes inline CSS custom properties, so one stylesheet themes every setup.
- `src/scripts/` — client modules, entry `main.ts` (init order + delegated click/keyboard handlers). `dom.ts` holds shared utils (`$`, `$$`, `store`, `toast`, `state.ready`). Client code must **not** import `src/data/setups.ts` (it would ship all content); it reads the `#setupsIndex` JSON embedded by `Home.astro` and `data-*` attributes instead. `lab.ts` reads its initial design from `#lab[data-design]`, or from legacy `?theme=…` query params if present.
- `src/styles/global.css` — all styling. Light, neutral page (warm paper `--page`, near-black `--ink`, one green `--accent` used only for details); the colour comes from the dark terminals themselves. Design tokens live on `:root`; there is no dark mode. An `is:inline` script in `Base.astro` applies the saved `crt` class from `localStorage` before first paint (keep in sync with `scripts/crt.ts`).
- **Hero** (`Hero.astro`): centered copy plus a live demo terminal. `lib/demo.ts` (pure) builds its lines and theme CSS vars; the build renders the first state, and `scripts/demo.ts` loops: type a `kitty +kitten themes` command → swap the theme (CSS colour transitions) → pause; the dots below jump to a theme, and it pauses off-screen. Entrance animation: an inline script adds `html.intro` (hidden initial state, 3.5 s safety timeout) and `scripts/intro.ts` runs staggered Web Animations once fonts are ready (≤900 ms), then sets `data-intro="done"`. Skipped under reduced motion.
- The sticky `#topbar` (`Nav.astro`) gets a bottom border (`.scrolled`) once the page leaves the top (`effects.ts`).
- **Backend (saved Lab designs).** The site is `output: 'static'` with the `@astrojs/vercel` adapter; only routes with `export const prerender = false` run on the server: `POST /api/designs`, `GET /api/designs/[id]` and the page `/s/[id]` (renders `Home` with the Lab preloaded, increments `views`).
  - DB: libSQL/Turso via Drizzle. Schema in `src/db/schema.ts`, migrations in `drizzle/`. `src/db/client.ts` reads `TURSO_DATABASE_URL` (default `file:local.db`) / `TURSO_AUTH_TOKEN` through `astro:env` (declared in `astro.config.mjs`).
  - A UNIQUE index on (theme, font, prompt, cursor, size) makes saving idempotent: the same design always maps to the same id, and the table is bounded by the number of combinations (hence no rate limiting).
  - Data logic lives in `src/server/designs.ts` and takes the `db` as a parameter, so tests can pass an in-memory database. Request validation uses the strict Zod `designSchema` (`lib/design.ts`); `normalizeDesign` is the lenient variant for URL params.
  - Ids: `lib/ids.ts` (7 chars, unambiguous alphabet, `ID_PATTERN` validated before querying).
  - Client: "Copiar enlace" calls `shortLink()` in `scripts/lab.ts` (falls back to the long `?theme=…` URL if the API fails); `copyInstall` accepts a `Promise<string>` and uses `ClipboardItem` so Safari keeps the click's user activation.
  - `/s/[id]` cannot `Astro.rewrite('/404')` (prerendered target → ForbiddenRewrite); it returns an empty 404 `Response`, which Astro fills with `src/pages/404.astro`.
- Fonts are self-hosted via `@fontsource` (imported in `Base.astro`). Geist comes from the variable packages, so CSS family names are `'Geist Variable'` / `'Geist Mono Variable'`.

## Conventions

- Respect `prefers-reduced-motion` (`reduced` in `scripts/dom.ts`) for any new animation.
- Keep the restrained visual language: neutral light page, black solid buttons, one accent colour used sparingly, one typeface (Geist / Geist Mono) with bold tight headings, no grain/blob/glow gimmicks.
- Nerd Font icons are intentionally replaced with plain Unicode glyphs; the site uses no images.
- `lines`, `specs` and `status` fields in `setups.ts` are trusted HTML (rendered with `set:html`); everything else goes through Astro's escaping or `esc()`.
