import { $, $$, root } from './dom';

/* ══════════ entrada del hero ══════════
   El script en línea de Hero.astro añade `intro` (estado inicial oculto) antes de pintar.
   Aquí se espera a las fuentes y al primer fotograma del horizonte (máx. 900 ms) y se
   anima cada pieza con la Web Animations API. */

declare global { interface Window { __introTimer?: number } }

const QUINT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const DRAW = 'cubic-bezier(0.7, 0, 0.2, 1)';

const timeout = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export async function runIntro(horizonReady: Promise<void>) {
  if (!root.classList.contains('intro')) return;
  await Promise.race([Promise.all([document.fonts.ready, horizonReady]), timeout(900)]);
  clearTimeout(window.__introTimer);
  if (!root.classList.contains('intro')) return;   // ya se mostró por el temporizador de seguridad

  // las distancias escalan con el tamaño del logo (k ∈ [0.65, 1])
  const k = Math.min(1, Math.max(0.65, $('.wordmark').getBoundingClientRect().height / 23.5));
  const rise = (px: number, extra: Keyframe = {}): Keyframe[] => [{ opacity: 0, transform: `translateY(${px * k}px)`, ...extra }, { opacity: 1, transform: 'none' }];

  const [left, center, right] = $$('.masthead nav a');
  const steps: [Element, Keyframe[], number, number, string][] = [
    [$('.wordmark'), rise(-6), 60, 900, QUINT],
    [$('.hairline'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 180, 1000, DRAW],
    [center!, rise(-4), 420, 700, QUINT],
    [left!, rise(-4), 490, 700, QUINT],
    [right!, rise(-4), 490, 700, QUINT],
    ...$$('.headline .li').map((li, i): [Element, Keyframe[], number, number, string] =>
      [li, [{ transform: 'translateY(104%)' }, { transform: 'none' }], 200 + i * 90, 1100, EXPO]),
    [$('.subhead'), rise(10), 700, 850, QUINT],
    [$('.hero .btn'), rise(12, { transform: `translateY(${12 * k}px) scale(0.975)` }), 860, 900, EXPO],
    [$('.discover'), rise(6), 1040, 700, QUINT],
    [$('.discover svg'), [{ transform: `translateY(${-5 * k}px)` }, { transform: 'none' }], 1120, 820, EXPO],
  ];
  const anims = steps.map(([el, frames, delay, duration, easing]) => el.animate(frames, { delay, duration, easing, fill: 'both' }));

  // las animaciones ya mantienen el estado final: se puede quitar el estado inicial
  root.classList.remove('intro');
  await Promise.all(anims.map(a => a.finished.catch(() => {})));
  anims.forEach(a => a.cancel());
  root.dataset.intro = 'done';
}
