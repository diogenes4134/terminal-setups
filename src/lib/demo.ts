import { PROMPTS, THEMES } from '../data/lab';
import { b, c, cur, t, type Line } from './term';

/* Terminal de demostración del hero: escribe un comando, aplica un tema y muestra su paleta.
   Funciones puras: el build pinta el primer estado y el navegador anima el resto. */

export type ThemeKey = keyof typeof THEMES;
export type PromptKey = keyof typeof PROMPTS;

export const DEMO_THEMES: ThemeKey[] = [
  'catppuccin',
  'tokyonight',
  'gruvbox',
  'dracula',
  'rosepine',
  'nord',
  'ubuntu',
  'campbell',
];
export const DEMO_PROMPTS: PromptKey[] = ['powerline', 'pure', 'h4ck3r', 'robby', 'kali'];

/** Número fijo de líneas: la ventana no cambia de alto entre pasos. */
const ROWS = 9;

export const demoCommand = (theme: ThemeKey) => `kitty +kitten themes "${THEMES[theme].name}"`;

/** Variables CSS de un tema (fondo, texto y los 16 colores ANSI). */
export const themeVars = (key: ThemeKey) => {
  const th = THEMES[key];
  return [`--bg:${th.bg}`, `--fg:${th.fg}`, ...th.ansi.map((h, i) => `--c${i}:${h}`)].join(';');
};

/**
 * Líneas de la demo: `typed` es lo escrito hasta ahora; con `applied`, el comando
 * ya se ejecutó y se muestra el resultado con la paleta de `theme`.
 */
export function demoLines(theme: ThemeKey, prompt: PromptKey, typed: string, applied: boolean): Line[] {
  const [top, pre] = PROMPTS[prompt].make();
  const withPrompt = (cmd: string): Line[] => (top ? [[top] as Line] : []).concat([[pre + cmd]]);
  const blocks = (from: number) => Array.from({ length: 8 }, (_, i) => c(`c${from + i}`, '███')).join(' ');

  const lines = withPrompt(t(typed) + (applied ? '' : cur));
  if (applied)
    lines.push(
      [c('c2', '✓ ') + t('tema aplicado: ') + b('fg', THEMES[theme].name)],
      [''],
      [blocks(0)],
      [blocks(8)],
      [''],
      ...withPrompt(cur),
    );
  while (lines.length < ROWS) lines.push(['']);
  return lines;
}
