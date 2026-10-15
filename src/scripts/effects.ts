import { HERO_CMDS } from '../data/site';
import { pad } from '../lib/term';
import { $, $$, reduced } from './dom';

/* ══════════ efecto: texto que se descifra ══════════ */
const GLYPHS = '!<>-_\\/[]{}=+*^?#░▒▓';
const busy = new WeakSet<HTMLElement>();
export function scramble(el: HTMLElement | null) {
  if (reduced || !el || busy.has(el)) return;
  const final = el.dataset.text || (el.dataset.text = el.textContent || '');
  const chars = [...final];
  let frame = 0;
  busy.add(el);
  (function tick() {
    const done = Math.floor(frame / 2);
    el.textContent = chars.map((ch, i) => (i < done || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    frame++;
    if (done < chars.length) requestAnimationFrame(tick);
    else { el.textContent = final; busy.delete(el); }
  })();
}

/* ══════════ hero: comandos que se escriben solos + foco que sigue al ratón ══════════ */
export function initHero() {
  const typed = $('#typed');
  if (reduced) typed.textContent = HERO_CMDS[0]!;
  else (async function loop() {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    for (let k = 0; ; k = (k + 1) % HERO_CMDS.length) {
      const cmd = HERO_CMDS[k]!;
      for (let j = 1; j <= cmd.length; j++) { typed.textContent = cmd.slice(0, j); await sleep(45 + Math.random() * 55); }
      await sleep(1600);
      for (let j = cmd.length; j >= 0; j--) { typed.textContent = cmd.slice(0, j); await sleep(18); }
      await sleep(300);
    }
  })();

  // foco del hero que sigue al ratón con inercia
  const hero = $('#hero'), blob = $('#blob');
  const pos = { x: hero.clientWidth / 2, y: hero.clientHeight * 0.4 };
  const target = { ...pos };
  let raf = 0;
  const move = () => {
    pos.x += (target.x - pos.x) * 0.06;
    pos.y += (target.y - pos.y) * 0.06;
    blob.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    raf = Math.hypot(target.x - pos.x, target.y - pos.y) > 0.5 ? requestAnimationFrame(move) : 0;
  };
  move();
  if (!reduced) hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    target.x = e.clientX - r.left;
    target.y = e.clientY - r.top;
    if (!raf) raf = requestAnimationFrame(move);
  });

  $$('#toc a').forEach(a => a.addEventListener('mouseenter', () => scramble($('.name', a))));
}

/* ══════════ aparición al hacer scroll ══════════ */
function countUp(el: HTMLElement) {
  const end = Number(el.dataset.count), t0 = performance.now(), dur = 1200;
  if (reduced) { el.textContent = pad(end); return; }
  (function step(now: number) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = pad(Math.round(end * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

export function initReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    el.classList.add('in');
    $$('[data-count]', el).forEach(countUp);
    if (el.matches('section.setup')) scramble($('h3', el));
    io.unobserve(el);
  }), { threshold: 0.12 });
  $$('[data-reveal], .term').forEach(el => io.observe(el));

  // nav: resalta la sección visible
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) $$<HTMLAnchorElement>('.nav .links a').forEach(a => a.classList.toggle('active', a.dataset.spy === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['indice', 'setups', 'lab'].forEach(id => spy.observe(document.getElementById(id)!));
}

/* ══════════ terminales: foco de luz + inclinación 3D ══════════ */
export function bindTerm(term: HTMLElement) {
  term.addEventListener('pointermove', e => {
    const r = term.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    term.style.setProperty('--mx', `${x}px`);
    term.style.setProperty('--my', `${y}px`);
    if (e.pointerType !== 'mouse' || reduced) return;
    term.style.setProperty('--ry', `${(x / r.width - 0.5) * 6}deg`);
    term.style.setProperty('--rx', `${(0.5 - y / r.height) * 6}deg`);
  });
  term.addEventListener('pointerleave', () => {
    term.style.setProperty('--rx', '0deg');
    term.style.setProperty('--ry', '0deg');
  });
}
