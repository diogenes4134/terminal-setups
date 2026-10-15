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

/* ══════════ aparición al hacer scroll + navegación ══════════ */
export function initReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target as HTMLElement;
    el.classList.add('in');
    if (el.matches('section.setup')) scramble($('h3', el));
    io.unobserve(el);
  }), { threshold: 0.12 });
  $$('[data-reveal], .term').forEach(el => io.observe(el));

  $$('#toc a').forEach(a => a.addEventListener('mouseenter', () => scramble($('.name', a))));

  // resalta en los menús la sección visible
  const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) $$<HTMLAnchorElement>('[data-spy]').forEach(a => a.classList.toggle('active', a.dataset.spy === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['indice', 'setups', 'lab'].forEach(id => spy.observe(document.getElementById(id)!));

  // la barra fija aparece cuando la cabecera del hero sale de pantalla
  const topbar = $('#topbar');
  new IntersectionObserver(([e]) => topbar.classList.toggle('on', !e?.isIntersecting)).observe($('.masthead'));
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
