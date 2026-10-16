import { THEMES } from '../data/lab';
import { DEMO_PROMPTS, DEMO_THEMES, demoCommand, demoLines, themeVars, type ThemeKey } from '../lib/demo';
import { renderLines } from '../lib/term';
import { $, $$, reduced } from './dom';
import { setLab } from './lab';
import { goTo } from './navigation';

/* ══════════ terminal de demostración del hero ══════════
   Ciclo: escribir el comando con el tema actual → "Enter" → el tema cambia (transición CSS)
   y aparece la paleta → pausa → siguiente tema. Se pausa fuera de pantalla. */

const term = $('#demoTerm'),
  linesEl = $('#demoLines'),
  title = $('#demoTitle');
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

let index = 0; // tema mostrado (posición en DEMO_THEMES)
let run = 0; // cada ciclo nuevo invalida el anterior
let visible = true;

function show(theme: ThemeKey, prompt: number, typed: string, applied: boolean) {
  linesEl.innerHTML = renderLines(demoLines(theme, DEMO_PROMPTS[prompt % DEMO_PROMPTS.length]!, typed, applied));
}
function apply(i: number) {
  index = i;
  const theme = DEMO_THEMES[i]!;
  term.setAttribute('style', `${themeVars(theme)};--font:'JetBrains Mono', monospace`);
  title.textContent = `${THEMES[theme].name} — zsh`;
  $$('#demoThemes button').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.theme === theme)));
}
async function waitVisible() {
  while (!visible || document.hidden) await sleep(300);
}

/** Escribe el comando del tema `next` y lo aplica. Devuelve false si otro ciclo lo ha sustituido. */
async function step(next: number, id: number) {
  const cmd = demoCommand(DEMO_THEMES[next]!);
  const current = DEMO_THEMES[index]!;
  for (let j = 0; j <= cmd.length; j++) {
    if (id !== run) return false;
    await waitVisible();
    show(current, index, cmd.slice(0, j), false);
    await sleep(28 + Math.random() * 45);
  }
  await sleep(380);
  if (id !== run) return false;
  apply(next);
  show(DEMO_THEMES[next]!, next, cmd, true);
  return true;
}

async function loop(start: number) {
  const id = ++run;
  let next = start;
  while (id === run) {
    if (!(await step(next, id))) return;
    await sleep(3400);
    next = (next + 1) % DEMO_THEMES.length;
  }
}

export function initDemo() {
  new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
  }).observe(term);

  // elegir un tema a mano: se aplica al momento y el ciclo sigue desde ahí
  $('#demoThemes').addEventListener('click', e => {
    const btn = (e.target as Element).closest<HTMLElement>('button[data-theme]');
    if (!btn) return;
    const i = DEMO_THEMES.indexOf(btn.dataset.theme as ThemeKey);
    run++;
    apply(i);
    show(DEMO_THEMES[i]!, i, demoCommand(DEMO_THEMES[i]!), true);
    if (!reduced) sleep(4200).then(() => loop((i + 1) % DEMO_THEMES.length));
  });
  // abrir el tema que se está viendo en el laboratorio
  $('#demoLab').addEventListener('click', e => {
    e.preventDefault();
    setLab('theme', DEMO_THEMES[index]!);
    goTo('lab');
  });

  if (!reduced) sleep(2600).then(() => loop(1));
}
