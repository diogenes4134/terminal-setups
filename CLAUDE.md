# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static, dependency-free showcase site (UI text in Spanish) that recreates terminal configurations (Kitty, WezTerm, Windows Terminal, etc.) purely in HTML/CSS, plus a "Lab" that lets visitors compose their own terminal and export the config. There is no build step, package manager, linter, or test suite.

**Run it:** open `index.html` directly, or serve the folder (e.g. `python3 -m http.server`) and visit the printed URL. Scripts are plain `<script>` tags (no modules), loaded in order: `js/data.js` then `js/app.js`.

## Architecture

- `js/data.js` — all content and the string-building helpers, as globals consumed by `app.js`:
  - Helpers `c/b/it(colorKey, text)` produce colored/bold/italic `<span>`s (escaped via `esc`); `t` escapes plain text; `cur` is the cursor span. `segs`, `roundSegs`, `segsR` build powerline segments. A color key is either a palette variable name (`'green'` → `var(--green)`) or a literal `#hex`.
  - `SETUPS` — array of setup objects: `id`, `name`, `vibes`, `tag`, `desc`, `window`, optional `chrome` (`'win'`/`'gnome'`, default mac), `font`, `palette` (becomes CSS custom properties on that terminal), `swatches`, `lines` (array of `[left, right?]` HTML strings), `specs`, `install` (shell script text shown in the Instalar tab). Adding a setup = adding one object here; the index, filters, counts, hero stats, command palette and prev/next navigation all derive from `SETUPS`.
  - `VIBES` (filter chips), `THEMES` (Lab themes with `bg`, `fg`, 16 `ansi` colors), `FONTS`, `PROMPTS` (Lab prompts using `c0…c15`/`fg`/`bg` keys so they follow the chosen theme), `CURSORS`, `TOOLS` (marquee), `HERO_CMDS` (typing animation).
- `js/app.js` — everything is rendered client-side from the data: `renderSetup` builds each section into `#setups`, then TOC, filters, marquee, hero effects, scroll reveal (`IntersectionObserver` + `data-reveal`), light/dark theme toggle (View Transitions API), CRT mode, command palette (Ctrl/⌘ K, fuzzy search), keyboard shortcuts (T, C, J/K), Lab rendering and export.
- Lab export: `exportConfig` generates `kitty.conf` / `alacritty.toml` / ghostty output from the `lab` state; the state is also shareable via URL query params (`theme`, `font`, `prompt`, `cursor`, `size`) built in `shareUrl` and read back at startup.
- `css/styles.css` — all styling. Terminals are themed via inline CSS custom properties (set from `palette`, `--font`, `--ff`, `--lh`, `--frame`, `--bar`); page theme uses `data-theme` / `data-mode` on `<html>` and a `crt` class.
- Persistence: only `localStorage` keys `theme` and `crt`, wrapped in try/catch (`store`). An inline script in `<head>` applies them before first paint to avoid flashing — keep it in sync with `app.js` if the keys change.

## Conventions

- Respect `prefers-reduced-motion` (`reduced` flag in `app.js`) for any new animation.
- Nerd Font icons are intentionally replaced with plain Unicode glyphs; the site uses no images.
- Insert user-visible dynamic strings through `esc()`; `lines`/`specs` fields are trusted HTML authored in `data.js`.
