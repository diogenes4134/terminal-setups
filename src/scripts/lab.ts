import { FONTS, PROMPTS, THEMES } from '../data/lab';
import { designFromParams, designLabel, designToParams, normalizeDesign, type Design } from '../lib/design';
import { exportConfig, type ExportFormat } from '../lib/export';
import { b, c, cur, highlight, renderLines, t, type Line } from '../lib/term';
import { $, $$, state } from './dom';

/* ══════════ laboratorio ══════════ */
const section = $('#lab');
// diseño inicial: el que trae la página (p. ej. /s/<id>) o, si hay, los query params de los enlaces antiguos
const params = new URLSearchParams(location.search);
export const lab: Design = params.has('theme')
  ? designFromParams(params)
  : normalizeDesign(JSON.parse(section.dataset.design || '{}'));
export let fmt: ExportFormat = 'kitty';

export const currentExport = () => exportConfig(lab, fmt);
export const shareUrl = () => `${location.origin}/?${designToParams(lab)}#lab`;

export function renderLab() {
  const th = THEMES[lab.theme], f = FONTS[lab.font];
  const [top, pre] = PROMPTS[lab.prompt].make();
  const term = $('#labTerm');
  term.setAttribute('style', [`--bg:${th.bg}`, `--fg:${th.fg}`, ...th.ansi.map((h, i) => `--c${i}:${h}`),
    `--font:${f.css}`, `--fs:${lab.size}px`].join(';'));
  term.dataset.cursor = lab.cursor;

  const prompt = (cmd: string): Line[] => (top ? [[top] as Line] : []).concat([[pre + cmd]]);
  const ls = b('c4', 'src/') + '  ' + b('c4', 'docs/') + '  ' + c('c2', 'build.sh') + '  ' + t('README.md') + '  ' + c('c1', 'old.tar.gz');
  const blocks = (from: number) => th.ansi.slice(from, from + 8).map((_, i) => c(`c${from + i}`, '███')).join(' ');
  $('#labLines').innerHTML = renderLines([
    ...prompt(t('ls')), [ls], [''],
    ...prompt(t('colors')), [blocks(0)], [blocks(8)], [''],
    ...prompt(cur),
  ]);
  $('#labTitle').textContent = designLabel(lab);
  $('#labSizeOut').textContent = `${lab.size} px`;
  $<HTMLInputElement>('#labSize').value = String(lab.size);
  $$('#labControls .chip').forEach(ch => ch.setAttribute('aria-pressed', String(lab[ch.dataset.group as keyof Design] === ch.dataset.value)));
  $('#labExport').innerHTML = highlight(currentExport());
  if (state.ready) try { history.replaceState(null, '', shareUrl()); } catch { /* p. ej. file:// */ }
}

export function setLab<K extends keyof Design>(key: K, value: Design[K]) {
  Object.assign(lab, normalizeDesign({ ...lab, [key]: value }));
  renderLab();
}

export function setFormat(next: ExportFormat) {
  fmt = next;
  renderLab();
}

export function initLab() {
  $<HTMLInputElement>('#labSize').addEventListener('input', e => setLab('size', Number((e.target as HTMLInputElement).value)));
  renderLab();
}
