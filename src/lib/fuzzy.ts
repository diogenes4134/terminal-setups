import { esc } from './term';

// búsqueda difusa: las letras de la consulta deben aparecer en orden (ignora mayúsculas y tildes)
const fold = (s: string) => [...s].map(ch => ch.normalize('NFD')[0]!.toLowerCase());

/** Devuelve la etiqueta con las coincidencias en `<mark>` y una puntuación (0 = subcadena exacta), o null si no coincide. */
export function fuzzy(label: string, query: string): { html: string; score: number } | null {
  if (!query) return { html: esc(label), score: 0 };
  const L = fold(label), Q = fold(query).filter(ch => ch !== ' ');
  const chars = [...label];
  let qi = 0, html = '';
  L.forEach((ch, i) => {
    if (qi < Q.length && ch === Q[qi]) { html += `<mark>${esc(chars[i])}</mark>`; qi++; }
    else html += esc(chars[i]);
  });
  if (qi < Q.length) return null;
  return { html, score: L.join('').includes(fold(query).join('')) ? 0 : 1 };
}
