/* ══════════ helpers para pintar líneas de terminal ══════════
   Funciones puras que devuelven HTML como string: se usan tanto en el build
   (setups) como en el navegador (laboratorio). */

/** Segmento powerline: [fondo, texto, contenido] */
export type Seg = [bg: string, fg: string, text: string];
/** Línea de terminal: [izquierda, derecha opcional], ambas en HTML */
export type Line = [left: string, right?: string];

export const esc = (s: unknown) =>
  String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!);

/** Clave de paleta (`green` → `var(--green)`) o color literal (`#hex`). */
const col = (k: string) => (k.startsWith('#') ? k : `var(--${k})`);

export const c = (k: string, text: string) => `<span style="color:${col(k)}">${esc(text)}</span>`;
export const b = (k: string, text: string) => `<span class="b" style="color:${col(k)}">${esc(text)}</span>`;
export const it = (k: string, text: string) => `<span class="it" style="color:${col(k)}">${esc(text)}</span>`;
export const t = (text: string) => esc(text);
export const cur = '<span class="cursor"></span>';

const powerline = (items: Seg[], round: boolean) =>
  `<span class="segs">${items
    .map(
      ([bg, fg, text], i) =>
        `<span class="seg${i === 0 && round ? ' round' : ''}" style="--sb:${col(bg)};color:${col(fg)};z-index:${items.length - i}">${esc(text)}</span>`,
    )
    .join('')}</span>`;
export const segs = (...items: Seg[]) => powerline(items, false);
export const roundSegs = (...items: Seg[]) => powerline(items, true);
export const segsR = (...items: Seg[]) =>
  `<span class="segs">${items
    .map(([bg, fg, text], i) => `<span class="seg-r" style="--sb:${col(bg)};color:${col(fg)};z-index:${i + 1}">${esc(text)}</span>`)
    .join('')}</span>`;

export const renderLines = (lines: Line[]) =>
  lines
    .map(([l, r], k) => `<div class="ln" style="--i:${k}"><span>${l || ' '}</span>${r ? `<span>${r}</span>` : ''}</div>`)
    .join('');

// resalta como comentario solo “# texto”, no los colores “#282828”
export const highlight = (code: string) => esc(code).replace(/(^|\s)(#(?:\s.*|$))/gm, '$1<span class="cm">$2</span>');

export const pad = (n: number) => String(n).padStart(2, '0');
