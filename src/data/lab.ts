import { b, c, roundSegs } from '../lib/term';

/* ══════════ laboratorio: temas con los 16 colores ANSI ══════════ */
export interface Theme {
  name: string;
  bg: string;
  fg: string;
  /** 16 colores: normales (0–7) y brillantes (8–15) */
  ansi: string[];
}

export const THEMES = {
  ubuntu:     { name: 'Ubuntu',          bg: '#300A24', fg: '#FFFFFF', ansi: ['#1B1B1B','#CC1A12','#4E9A06','#C4A000','#3667A6','#7F5985','#06989A','#D5D5D5','#838383','#F93632','#8AE234','#FCE94F','#729FCF','#AD7FA8','#34E2E2','#EEEEEC'] },
  catppuccin: { name: 'Catppuccin Mocha', bg: '#1e1e2e', fg: '#cdd6f4', ansi: ['#45475a','#f38ba8','#a6e3a1','#f9e2af','#89b4fa','#f5c2e7','#94e2d5','#bac2de','#585b70','#f38ba8','#a6e3a1','#f9e2af','#89b4fa','#f5c2e7','#94e2d5','#a6adc8'] },
  tokyonight: { name: 'Tokyo Night',     bg: '#1a1b26', fg: '#c0caf5', ansi: ['#15161e','#f7768e','#9ece6a','#e0af68','#7aa2f7','#bb9af7','#7dcfff','#a9b1d6','#414868','#f7768e','#9ece6a','#e0af68','#7aa2f7','#bb9af7','#7dcfff','#c0caf5'] },
  gruvbox:    { name: 'Gruvbox Dark',    bg: '#282828', fg: '#ebdbb2', ansi: ['#282828','#cc241d','#98971a','#d79921','#458588','#b16286','#689d6a','#a89984','#928374','#fb4934','#b8bb26','#fabd2f','#83a598','#d3869b','#8ec07c','#ebdbb2'] },
  dracula:    { name: 'Dracula',         bg: '#282a36', fg: '#f8f8f2', ansi: ['#21222c','#ff5555','#50fa7b','#f1fa8c','#bd93f9','#ff79c6','#8be9fd','#f8f8f2','#6272a4','#ff6e6e','#69ff94','#ffffa5','#d6acff','#ff92df','#a4ffff','#ffffff'] },
  rosepine:   { name: 'Rosé Pine',       bg: '#191724', fg: '#e0def4', ansi: ['#26233a','#eb6f92','#31748f','#f6c177','#9ccfd8','#c4a7e7','#ebbcba','#e0def4','#6e6a86','#eb6f92','#31748f','#f6c177','#9ccfd8','#c4a7e7','#ebbcba','#e0def4'] },
  nord:       { name: 'Nord',            bg: '#2e3440', fg: '#d8dee9', ansi: ['#3b4252','#bf616a','#a3be8c','#ebcb8b','#81a1c1','#b48ead','#88c0d0','#e5e9f0','#4c566a','#bf616a','#a3be8c','#ebcb8b','#81a1c1','#b48ead','#8fbcbb','#eceff4'] },
  campbell:   { name: 'Campbell',        bg: '#0c0c0c', fg: '#cccccc', ansi: ['#0c0c0c','#c50f1f','#13a10e','#c19c00','#0037da','#881798','#3a96dd','#cccccc','#767676','#e74856','#16c60c','#f9f1a5','#3b78ff','#b4009e','#61d6d6','#f2f2f2'] },
} satisfies Record<string, Theme>;

export const FONTS = {
  jetbrains: { name: 'JetBrains Mono',  css: "'JetBrains Mono', monospace" },
  fira:      { name: 'Fira Code',       css: "'Fira Code', monospace" },
  plex:      { name: 'IBM Plex Mono',   css: "'IBM Plex Mono', monospace" },
  victor:    { name: 'Victor Mono',     css: "'Victor Mono', monospace" },
  source:    { name: 'Source Code Pro', css: "'Source Code Pro', monospace" },
  geist:     { name: 'Geist Mono',      css: "'Geist Mono Variable', monospace" },
};

/* Cada prompt devuelve [línea superior | null, prefijo de la línea de comandos].
   Usa los colores ANSI del tema: c0…c15, fg y bg. */
type PromptMaker = () => [top: string | null, prefix: string];

export const PROMPTS = {
  h4ck3r: { name: 'h4ck3r', make: () => [
    c('c2', '┌──[') + b('c10', 'Guyen') + c('c2', ']─[') + b('fg', '~/lab') + c('c2', ']─[') + b('c14', '⎇ main') + c('c2', ']'),
    c('c2', '└─') + b('c10', '$') + ' '] },
  kali: { name: 'Kali', make: () => [
    c('c2', '┌──(') + b('c4', 'user㉿host') + c('c2', ')-[') + b('fg', '~/lab') + c('c2', ']'),
    c('c2', '└─') + b('c4', '$') + ' '] },
  powerline: { name: 'Powerline', make: () => [
    roundSegs(['c4', 'bg', ' ~/lab '], ['c3', 'bg', ' ⎇ main '], ['c2', 'bg', ' ✔ ']),
    b('c2', '❯') + ' '] },
  pure: { name: 'Pure', make: () => [
    c('c4', '~/lab') + ' ' + c('c8', 'main*'),
    c('c5', '❯') + ' '] },
  robby: { name: 'robbyrussell', make: () => [
    null,
    b('c2', '➜') + '  ' + b('c6', 'lab') + ' ' + b('c4', 'git:(') + b('c1', 'main') + b('c4', ')') + ' '] },
} satisfies Record<string, { name: string; make: PromptMaker }>;

export const CURSORS = { beam: 'Barra', block: 'Bloque', underline: 'Subrayado' };
/** nombres que espera Alacritty en `cursor.style.shape` */
export const CURSORS_EN = { beam: 'Beam', block: 'Block', underline: 'Underline' } satisfies Record<keyof typeof CURSORS, string>;

export const SIZE = { min: 11, max: 18 };

export const EXPORT_FORMATS = { kitty: 'kitty.conf', alacritty: 'alacritty.toml', ghostty: 'ghostty' };
