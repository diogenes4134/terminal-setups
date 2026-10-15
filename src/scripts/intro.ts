import { $, $$, root } from './dom';

/* ══════════ entrada del hero ══════════
   El script en línea de Hero.astro añade `intro` (estado inicial oculto) antes de pintar.
   Aquí se espera a las fuentes (máx. 900 ms) y se anima cada pieza con la Web Animations API. */

declare global { interface Window { __introTimer?: number } }

const QUINT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const timeout = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const rise = (px: number, extra: Keyframe = {}): Keyframe[] => [{ opacity: 0, transform: `translateY(${px}px)`, ...extra }, { opacity: 1, transform: 'none' }];

export async function runIntro() {
  if (!root.classList.contains('intro')) return;
  await Promise.race([document.fonts.ready, timeout(900)]);
  clearTimeout(window.__introTimer);
  if (!root.classList.contains('intro')) return;   // ya se mostró por el temporizador de seguridad

  const steps: [Element, Keyframe[], number, number, string][] = [
    [$('.topbar'), rise(-8), 0, 800, QUINT],
    [$('.eyebrow'), rise(8), 120, 800, QUINT],
    ...$$('.headline .li').map((li, i): [Element, Keyframe[], number, number, string] =>
      [li, [{ transform: 'translateY(104%)' }, { transform: 'none' }], 180 + i * 90, 1100, EXPO]),
    [$('.subhead'), rise(10), 620, 850, QUINT],
    [$('.hero .actions'), rise(12, { transform: 'translateY(12px) scale(0.98)' }), 780, 900, EXPO],
    [$('.hero .note'), rise(6), 920, 700, QUINT],
    [$('.demo'), rise(40, { transform: 'translateY(40px) scale(0.985)' }), 900, 1300, EXPO],
  ];
  const anims = steps.map(([el, frames, delay, duration, easing]) => el.animate(frames, { delay, duration, easing, fill: 'both' }));

  // las animaciones ya mantienen el estado inicial durante su retardo: se puede quitar la clase
  root.classList.remove('intro');
  await Promise.all(anims.map(a => a.finished.catch(() => {})));
  anims.forEach(a => a.cancel());
  root.dataset.intro = 'done';
}
