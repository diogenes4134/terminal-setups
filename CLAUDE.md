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
```

Requires Node 24 (`.nvmrc`). TypeScript is pinned to 6.x because `astro check` does not support TS 7 yet.

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
- Fonts are self-hosted via `@fontsource` (imported in `Base.astro`). Geist comes from the variable packages, so CSS family names are `'Geist Variable'` / `'Geist Mono Variable'`.

## Conventions

- Respect `prefers-reduced-motion` (`reduced` in `scripts/dom.ts`) for any new animation.
- Nerd Font icons are intentionally replaced with plain Unicode glyphs; the site uses no images.
- `lines`, `specs` and `status` fields in `setups.ts` are trusted HTML (rendered with `set:html`); everything else goes through Astro's escaping or `esc()`.
