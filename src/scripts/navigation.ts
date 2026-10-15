import { pad } from '../lib/term';
import { $, $$, SETUPS_INDEX, behavior, reduced, root, state, toast } from './dom';

/* ══════════ filtros ══════════ */
export function applyFilter(v: string) {
  const chips = $$('#filters .chip');
  if (!chips.some(ch => ch.dataset.v === v)) v = 'all';
  const run = () => {
    chips.forEach(ch => ch.setAttribute('aria-pressed', String(ch.dataset.v === v)));
    let n = 0;
    $$('section.setup').forEach(sec => {
      const show = v === 'all' || (sec.dataset.vibes ?? '').split(' ').includes(v);
      if (show) n++;
      sec.hidden = !show;
      $(`#toc li[data-id="${sec.id}"]`).hidden = !show;
    });
    $('#count').textContent = `${pad(n)} / ${pad(SETUPS_INDEX.length)}`;
  };
  if (!document.startViewTransition || reduced || !state.ready) return run();
  root.classList.add('vt');   // nombres de transición solo mientras se filtra
  document.startViewTransition(run).finished.finally(() => root.classList.remove('vt'));
}

/* ══════════ navegación ══════════ */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.hidden) applyFilter('all');
  requestAnimationFrame(() => el.scrollIntoView({ behavior }));
}

export function stepSetup(dir: 1 | -1) {
  const secs = $$('section.setup:not([hidden])');
  const target = dir > 0
    ? secs.find(s => s.getBoundingClientRect().top > 60)
    : secs.filter(s => s.getBoundingClientRect().top < -20).pop();
  if (!target) return toast(dir > 0 ? 'Ya estás en la última' : 'Ya estás en la primera');
  target.scrollIntoView({ behavior });
  toast(SETUPS_INDEX.find(s => s.id === target.id)?.name ?? '');
}

/* ══════════ pestañas ══════════ */
export function selectTab(tabs: HTMLElement, btn: HTMLElement) {
  const btns = $$('button', tabs);
  tabs.style.setProperty('--k', String(btns.indexOf(btn)));
  btns.forEach(x => x.setAttribute('aria-selected', String(x === btn)));
}
