# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Showcase site (UI text in Spanish) that recreates terminal configurations (Kitty, WezTerm, Windows Terminal…) purely in HTML/CSS, plus a "Lab" where visitors compose their own terminal and export the config. Built with **Astro 7 + TypeScript (strict)**, deployed to Vercel. The pre-migration static version is preserved at git tag `v0-static`.

The migration plan (backend for saved Lab designs, tests, CI, Vercel) lives in `/home/naelsherin/.claude/plans/quiero-que-sea-una-functional-kahan.md`.

## Commands

```bash
npm run dev       # dev server on http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve dist/
npm run check     # astro check (typecheck .astro + .ts)
npm run db:migrate   # apply drizzle/ migrations (local: creates/updates local.db)
npm run db:generate  # create a new migration after editing src/db/schema.ts
npm run db:studio    # browse the database
```

Requires Node 24 (`.nvmrc`). TypeScript is pinned to 6.x because `astro check` does not support TS 7 yet. Run `npm run db:migrate` once before `npm run dev`. `astro preview` does not work with the Vercel adapter; use `npm run dev` to exercise API routes.

## Architecture

Content is rendered **at build time**; the browser only gets a small JS bundle for interactivity.

- `src/data/` — all content. `setups.ts` (`SETUPS: Setup[]`, `VIBES`, and the shared prompt builders like `guyenTop`), `lab.ts` (`THEMES` with 16 ANSI colors, `FONTS`, `PROMPTS`, `CURSORS`, `SIZE`, `EXPORT_FORMATS`), `site.ts` (`TOOLS` marquee, `HERO_CMDS`). Adding a setup = one object in `SETUPS`; index, filters, counts, command palette and J/K navigation all derive from it.
- `src/lib/` — pure, isomorphic helpers (usable in build and browser, unit-testable):
  - `term.ts`: `c/b/it(colorKey, text)` build colored spans (escaped via `esc`), `segs/roundSegs/segsR` powerline segments, `renderLines`, `highlight`. A color key is a palette variable name (`'green'` → `var(--green)`) or a literal `#hex`.
  - `design.ts`: the `Design` type (theme/font/prompt/cursor/size), `DEFAULT_DESIGN`, `normalizeDesign` (validates unknown input, falls back to defaults), query-param (de)serialization.
  - `export.ts`: `exportConfig(design, fmt)` → kitty.conf / alacritty.toml / ghostty text.
  - `fuzzy.ts`: command-palette matching (accent/case-insensitive, in-order letters).
- `src/components/` — `Home.astro` composes the page (Nav, Hero, Index, Setup ×N, Lab, Footer, CommandPalette) and accepts an optional `design` prop that preloads the Lab. Each terminal's `palette` becomes inline CSS custom properties, so one stylesheet themes every setup.
- `src/scripts/` — client modules, entry `main.ts` (init order + delegated click/keyboard handlers). `dom.ts` holds shared utils (`$`, `$$`, `store`, `toast`, `state.ready`). Client code must **not** import `src/data/setups.ts` (it would ship all content); it reads the `#setupsIndex` JSON embedded by `Home.astro` and `data-*` attributes instead. `lab.ts` reads its initial design from `#lab[data-design]`, or from legacy `?theme=…` query params if present.
- `src/styles/global.css` — all styling (ported 1:1). Page theme uses `data-theme`/`data-mode` on `<html>` and a `crt` class; an `is:inline` script in `src/layouts/Base.astro` applies saved `theme`/`crt` from `localStorage` before first paint — keep it in sync with `scripts/theme.ts` if keys change.
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
- Nerd Font icons are intentionally replaced with plain Unicode glyphs; the site uses no images.
- `lines`, `specs` and `status` fields in `setups.ts` are trusted HTML (rendered with `set:html`); everything else goes through Astro's escaping or `esc()`.
