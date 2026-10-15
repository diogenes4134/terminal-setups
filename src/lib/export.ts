import { CURSORS_EN, EXPORT_FORMATS, FONTS, THEMES } from '../data/lab';
import type { Design } from './design';

export type ExportFormat = keyof typeof EXPORT_FORMATS;

const NAMES = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];

/** Genera el archivo de configuración del emulador para un diseño. */
export function exportConfig(d: Design, fmt: ExportFormat): string {
  const th = THEMES[d.theme], f = FONTS[d.font];
  if (fmt === 'alacritty') return [
    `# ~/.config/alacritty/alacritty.toml · ${th.name}`,
    '[font]', `normal = { family = "${f.name}" }`, `size = ${d.size}`, '',
    '[cursor.style]', `shape = "${CURSORS_EN[d.cursor]}"`, '',
    '[colors.primary]', `background = "${th.bg}"`, `foreground = "${th.fg}"`, '',
    '[colors.normal]', ...NAMES.map((n, i) => `${n} = "${th.ansi[i]}"`), '',
    '[colors.bright]', ...NAMES.map((n, i) => `${n} = "${th.ansi[i + 8]}"`),
  ].join('\n');
  if (fmt === 'ghostty') return [
    `# ~/.config/ghostty/config · ${th.name}`,
    `font-family = ${f.name}`, `font-size = ${d.size}`, `cursor-style = ${d.cursor === 'beam' ? 'bar' : d.cursor}`, '',
    `background = ${th.bg.slice(1)}`, `foreground = ${th.fg.slice(1)}`,
    ...th.ansi.map((h, i) => `palette = ${i}=${h}`),
  ].join('\n');
  return [
    `# ~/.config/kitty/kitty.conf · ${th.name}`,
    `font_family      ${f.name}`, `font_size        ${d.size}`, `cursor_shape     ${d.cursor}`, '',
    `background       ${th.bg}`, `foreground       ${th.fg}`, `cursor           ${th.fg}`,
    ...th.ansi.map((h, i) => `color${i}${i < 10 ? '  ' : ' '}${h}`),
  ].join('\n');
}
