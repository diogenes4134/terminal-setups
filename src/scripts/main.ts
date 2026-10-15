import type { Design } from '../lib/design';
import type { ExportFormat } from '../lib/export';
import { closeCmdk, initCmdk, isCmdkOpen, openCmdk, runCmdk } from './cmdk';
import { copyInstall } from './clipboard';
import { $, $$, state } from './dom';
import { bindTerm, initHero, initReveal } from './effects';
import { currentExport, initLab, setFormat, setLab, shareUrl } from './lab';
import { applyFilter, selectTab, stepSetup } from './navigation';
import { initTheme, isCRT, setCRT, toggleTheme } from './theme';

/* ══════════ arranque ══════════ */
initTheme();
setCRT(isCRT(), true);
if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) $$('kbd').forEach(k => { if (k.textContent === 'Ctrl K') k.textContent = '⌘ K'; });
initHero();
initReveal();
applyFilter('all');
initLab();
$$('.term').forEach(bindTerm);
initCmdk();

/* ══════════ atajos de teclado ══════════ */
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); isCmdkOpen() ? closeCmdk() : openCmdk(); return; }
  if (isCmdkOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
  if (k === '/' || e.key === '?') { e.preventDefault(); openCmdk(); }
  else if (k === 't') toggleTheme();
  else if (k === 'c') setCRT(!isCRT());
  else if (k === 'j') stepSetup(1);
  else if (k === 'k') stepSetup(-1);
});

/* ══════════ clics (delegación de eventos) ══════════ */
document.addEventListener('click', e => {
  const el = (e.target as Element).closest<HTMLElement>('button, .item, [data-close]');
  if (!el) return;

  if (el.id === 'themeBtn') return toggleTheme(e.clientX || null, e.clientY || null);
  if (el.id === 'crtBtn') return setCRT(!isCRT());
  if (el.id === 'cmdkBtn') return openCmdk();
  if (el.matches('[data-close]')) return closeCmdk();
  if (el.matches('#cmdkList .item')) return runCmdk(Number(el.dataset.i));

  if (el.matches('#filters .chip')) return applyFilter(el.dataset.v!);
  if (el.matches('#labControls .chip')) return setLab(el.dataset.group as keyof Design, el.dataset.value as never);
  if (el.matches('#exportTabs button')) { selectTab(el.parentElement!, el); return setFormat(el.dataset.fmt as ExportFormat); }

  if (el.matches('.setup .tabs button')) {
    selectTab(el.parentElement!, el);
    $$('.panel', el.closest('.setup')!).forEach(p => p.classList.toggle('on', p.dataset.panel === el.dataset.tab));
    return;
  }
  if (el.matches('.swatches button')) { $('.hex', el.parentElement!).textContent = el.dataset.hex!; return; }

  if (el.matches('button.copy')) {
    const text = el.dataset.copy === 'lab' ? currentExport()
      : el.dataset.copy === 'link' ? shareUrl()
      : $('pre', el.closest('.install')!).textContent ?? '';
    copyInstall(el, text);
  }
});
document.addEventListener('pointerover', e => {
  const sw = (e.target as Element).closest?.<HTMLElement>('.swatches button');
  if (sw) $('.hex', sw.parentElement!).textContent = sw.dataset.hex!;
});

state.ready = true;
