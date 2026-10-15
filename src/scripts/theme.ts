import { $, reduced, root, store, toast } from './dom';

/* ══════════ tema claro / oscuro ══════════ */
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const currentMode = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
const syncMode = () => { root.dataset.mode = currentMode(); };

export function initTheme() {
  syncMode();
  systemDark.addEventListener('change', syncMode);
}

export function toggleTheme(x?: number | null, y?: number | null) {
  const next = currentMode() === 'dark' ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; syncMode(); store.set('theme', next); };
  toast(next === 'dark' ? 'Tema oscuro' : 'Tema claro');
  if (!document.startViewTransition || reduced) return apply();
  if (x == null || y == null) { const r = $('#themeBtn').getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.7,0,.3,1)', pseudoElement: '::view-transition-new(root)' });
  });
}

/* ══════════ modo CRT ══════════ */
export const isCRT = () => root.classList.contains('crt');
export function setCRT(on: boolean, quiet = false) {
  root.classList.toggle('crt', on);
  $('#crtBtn').setAttribute('aria-pressed', String(on));
  store.set('crt', on ? '1' : '0');
  if (!quiet) toast(on ? 'Modo CRT activado' : 'Modo CRT desactivado');
}
