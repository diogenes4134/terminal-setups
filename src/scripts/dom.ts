/* ══════════ utilidades compartidas por los scripts del cliente ══════════ */
export const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel)!;
export const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)];
export const root = document.documentElement;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

export const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
};

/** `ready` se activa tras el primer render: antes no hay transiciones ni cambios de URL. */
export const state = { ready: false };

/** Índice ligero de los setups, incrustado en la página por Home.astro. */
export const SETUPS_INDEX: { id: string; name: string; tag: string }[] =
  JSON.parse(document.getElementById('setupsIndex')?.textContent || '[]');

let toastTimer = 0;
export function toast(msg: string) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 1800);
}
