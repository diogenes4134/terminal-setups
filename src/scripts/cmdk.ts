import { THEMES } from '../data/lab';
import { fuzzy } from '../lib/fuzzy';
import { esc } from '../lib/term';
import { $, SETUPS_INDEX, behavior } from './dom';
import { setLab } from './lab';
import { applyFilter, goTo, stepSetup } from './navigation';
import { isCRT, setCRT } from './crt';

/* ══════════ paleta de comandos ══════════ */
interface Command {
  group: string;
  label: string;
  hint?: string;
  run: () => void;
}

const cmdk = $('#cmdk'),
  input = $<HTMLInputElement>('#cmdkInput'),
  list = $('#cmdkList');
let items: (Command & { m: { html: string; score: number } })[] = [],
  sel = 0,
  lastFocus: Element | null = null;

const vibes = () =>
  [...document.querySelectorAll<HTMLElement>('#filters .chip')].map(ch => ({
    k: ch.dataset.v!,
    name: ch.firstChild?.textContent ?? '',
  }));

function commands(): Command[] {
  return [
    ...SETUPS_INDEX.map(s => ({ group: 'Configuraciones', label: s.name, hint: s.tag, run: () => goTo(s.id) })),
    { group: 'Ir a', label: 'Índice', run: () => goTo('indice') },
    { group: 'Ir a', label: 'Laboratorio', run: () => goTo('lab') },
    { group: 'Ir a', label: 'Volver arriba', run: () => scrollTo({ top: 0, behavior }) },
    { group: 'Acciones', label: `${isCRT() ? 'Desactivar' : 'Activar'} modo CRT`, hint: 'C', run: () => setCRT(!isCRT()) },
    { group: 'Acciones', label: 'Siguiente configuración', hint: 'J', run: () => stepSetup(1) },
    { group: 'Acciones', label: 'Configuración anterior', hint: 'K', run: () => stepSetup(-1) },
    ...vibes().map(v => ({
      group: 'Filtrar',
      label: `Estilo: ${v.name}`,
      run: () => {
        applyFilter(v.k);
        goTo('indice');
      },
    })),
    ...Object.entries(THEMES).map(([k, v]) => ({
      group: 'Laboratorio',
      label: `Probar tema ${v.name}`,
      run: () => {
        setLab('theme', k as keyof typeof THEMES);
        goTo('lab');
      },
    })),
  ];
}

function render() {
  const q = input.value.trim();
  items = commands()
    .flatMap(cmd => {
      const m = fuzzy(cmd.label, q);
      return m ? [{ ...cmd, m }] : [];
    })
    .sort((a, b) => a.m.score - b.m.score);
  sel = Math.min(sel, Math.max(items.length - 1, 0));
  if (!items.length) {
    list.innerHTML = '<li class="empty">Sin resultados</li>';
    return;
  }
  let group = '';
  list.innerHTML = items
    .map((x, i) => {
      const head = x.group !== group ? `<li class="grp" role="presentation">${esc((group = x.group))}</li>` : '';
      return `${head}<li class="item" role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === sel}">
      <span>${x.m.html}</span>${x.hint ? `<small>${esc(x.hint)}</small>` : ''}</li>`;
    })
    .join('');
  input.setAttribute('aria-activedescendant', `opt-${sel}`);
}

export const isCmdkOpen = () => !cmdk.hidden;

export function openCmdk() {
  lastFocus = document.activeElement;
  cmdk.hidden = false;
  input.value = '';
  sel = 0;
  render();
  input.focus();
}
export function closeCmdk() {
  cmdk.hidden = true;
  (lastFocus as HTMLElement | null)?.focus?.();
}
export function runCmdk(i: number) {
  const item = items[i];
  if (!item) return;
  closeCmdk();
  item.run();
}

export function initCmdk() {
  input.addEventListener('input', () => {
    sel = 0;
    render();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      render();
      document.getElementById(`opt-${sel}`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCmdk(sel);
    } else if (e.key === 'Escape') closeCmdk();
  });
}
