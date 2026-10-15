/* ══════════ utilidades ══════════ */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const behavior = reduced ? 'auto' : 'smooth';
const pad = n => String(n).padStart(2, '0');
const store = {
  get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
};
const state = { filter: 'all', ready: false };

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 1800);
}

// resalta como comentario solo “# texto”, no los colores “#282828”
const highlight = code => esc(code).replace(/(^|\s)(#(?:\s.*|$))/gm, '$1<span class="cm">$2</span>');

const renderLines = lines => lines.map(([l, r], k) =>
  `<div class="ln" style="--i:${k}"><span>${l || ' '}</span>${r ? `<span>${r}</span>` : ''}</div>`).join('');

/* ══════════ render: configuraciones ══════════ */
function chromeBar(s) {
  const title = `<span class="term-title">${esc(s.window)}</span>`;
  if (s.chrome === 'win') return `<span class="win-tab">${esc(s.window)}</span><span class="win-plus">+</span><span class="win-ctl"><i>—</i><i>▢</i><i>✕</i></span>`;
  if (s.chrome === 'gnome') return `${title}<span class="gnome-ctl"><i>≡</i><i>✕</i></span>`;
  return `<span class="dots"><i></i><i></i><i></i></span>${title}`;
}

function renderSetup(s, i) {
  const vars = Object.entries(s.palette).map(([k, v]) => `--${k}:${v}`).concat(
    `--font:${s.font}`, `--ff:${s.ff || 'normal'}`, `--lh:${s.lh || 1.55}`, `--cw:${s.cw || '2px'}`,
    s.frame ? `--frame:${s.frame}` : '', s.bar ? `--bar:${s.bar}` : ''
  ).filter(Boolean).join(';');

  const status = s.status ? `<div class="tmux"><span>${s.status[0]}</span><span>${esc(s.status[1])}</span></div>` : '';

  return `
  <section class="setup" id="${s.id}" data-reveal style="--vtn:v-${s.id}">
    <div class="rule"><span class="label">${pad(i + 1)} / ${pad(SETUPS.length)}</span><span class="label">${esc(s.tag)}</span></div>
    <div class="setup-head">
      <h3>${esc(s.name)}</h3>
      ${s.mine ? '<span class="badge">mi setup</span>' : ''}
      <span class="vibes">${s.vibes.map(v => `<span>${VIBES[v].toLowerCase()}</span>`).join('')}</span>
    </div>
    <p class="desc">${esc(s.desc)}</p>

    <div class="term chrome-${s.chrome || 'mac'}" style="${esc(vars)}" role="img" aria-label="Recreación de la terminal ${esc(s.name)}">
      <div class="term-bar">${chromeBar(s)}</div>
      <div class="term-body"><div class="lines">${renderLines(s.lines)}</div></div>
      ${status}
    </div>

    <div class="toolbar">
      <div class="swatches" aria-label="Paleta">
        ${s.swatches.map(h => `<button style="--s:${h}" data-hex="${h}" aria-label="${h}"></button>`).join('')}
        <span class="hex">${s.swatches[0]}</span>
      </div>
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="specs">Detalles</button>
        <button role="tab" aria-selected="false" data-tab="install">Instalar</button>
      </div>
    </div>

    <div class="panel on" data-panel="specs">
      <dl class="specs">${s.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
    </div>
    <div class="panel" data-panel="install">
      <div class="install">
        <div class="install-head"><span class="label">${s.chrome === 'win' ? 'powershell' : 'bash'}</span><button class="copy" data-i="${i}">Copiar</button></div>
        <pre>${highlight(s.install)}</pre>
      </div>
    </div>
  </section>`;
}

$('#setups').innerHTML = SETUPS.map(renderSetup).join('');

$('#toc').innerHTML = SETUPS.map((s, i) => `
  <li data-id="${s.id}" style="--vtl:l-${s.id}"><a href="#${s.id}">
    <span class="n">${pad(i + 1)}</span>
    <span class="name">${esc(s.name)}</span>
    <span class="meta">
      <span class="mini">${s.swatches.slice(2, 8).map((h, k) => `<i style="--s:${h};--k:${k}"></i>`).join('')}</span>
      <span class="tag">${esc(s.tag)}</span>
      <svg class="arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
    </span>
  </a></li>`).join('');

$('#filters').innerHTML = Object.entries(VIBES).map(([k, v]) => {
  const n = k === 'all' ? SETUPS.length : SETUPS.filter(s => s.vibes.includes(k)).length;
  return `<button class="chip" data-v="${k}" aria-pressed="${k === 'all'}">${v}<sup>${n}</sup></button>`;
}).join('');

const words = TOOLS.map(x => `<span>${esc(x)}</span>`).join('');
$('#track').innerHTML = words + words;   // duplicado → bucle sin saltos
$('#heroPill').textContent = `${SETUPS.length} configuraciones · laboratorio en vivo`;

const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
if (isMac) $$('kbd').forEach(k => { if (k.textContent === 'Ctrl K') k.textContent = '⌘ K'; });

/* ══════════ efecto: texto que se descifra ══════════ */
const GLYPHS = '!<>-_\\/[]{}=+*^?#░▒▓';
function scramble(el) {
  if (reduced || !el || el._busy) return;
  const final = el.dataset.text || (el.dataset.text = el.textContent);
  const chars = [...final];
  let frame = 0;
  el._busy = true;
  (function tick() {
    const done = Math.floor(frame / 2);
    el.textContent = chars.map((ch, i) => i < done || ch === ' ' ? ch : GLYPHS[Math.random() * GLYPHS.length | 0]).join('');
    frame++;
    if (done < chars.length) requestAnimationFrame(tick);
    else { el.textContent = final; el._busy = false; }
  })();
}
$$('#toc a').forEach(a => a.addEventListener('mouseenter', () => scramble($('.name', a))));

/* ══════════ hero ══════════ */
const title = $('#title');
let wi = 0;
title.innerHTML = [...title.childNodes].map(node => {
  const serif = node.nodeType === 1;
  return node.textContent.split(/(\s+)/).map(w => w.trim()
    ? `<span class="w${serif ? ' serif' : ''}" style="--i:${wi++}" aria-hidden="true">${esc(w)}</span>` : w).join('');
}).join('');

const typed = $('#typed');
if (reduced) typed.textContent = HERO_CMDS[0];
else (async function loop() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let k = 0; ; k = (k + 1) % HERO_CMDS.length) {
    const cmd = HERO_CMDS[k];
    for (let j = 1; j <= cmd.length; j++) { typed.textContent = cmd.slice(0, j); await sleep(45 + Math.random() * 55); }
    await sleep(1600);
    for (let j = cmd.length; j >= 0; j--) { typed.textContent = cmd.slice(0, j); await sleep(18); }
    await sleep(300);
  }
})();

// foco del hero que sigue al ratón con inercia
const hero = $('#hero'), blob = $('#blob');
const pos = { x: hero.clientWidth / 2, y: hero.clientHeight * .4 };
const target = { ...pos };
let blobRaf = 0;
const moveBlob = () => {
  pos.x += (target.x - pos.x) * .06;
  pos.y += (target.y - pos.y) * .06;
  blob.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  blobRaf = Math.hypot(target.x - pos.x, target.y - pos.y) > .5 ? requestAnimationFrame(moveBlob) : 0;
};
moveBlob();
if (!reduced) hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect();
  target.x = e.clientX - r.left;
  target.y = e.clientY - r.top;
  if (!blobRaf) blobRaf = requestAnimationFrame(moveBlob);
});

/* ══════════ aparición al hacer scroll ══════════ */
const COUNTS = { setups: SETUPS.length, tools: TOOLS.length, themes: Object.keys(THEMES).length };
function countUp(el) {
  const end = COUNTS[el.dataset.count], t0 = performance.now(), dur = 1200;
  if (reduced) { el.textContent = pad(end); return; }
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = pad(Math.round(end * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  $$('[data-count]', e.target).forEach(countUp);
  if (e.target.matches('section.setup')) scramble($('h3', e.target));
  io.unobserve(e.target);
}), { threshold: .12 });
$$('[data-reveal], .term').forEach(el => io.observe(el));

// nav: resalta la sección visible
const spy = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) $$('.nav .links a').forEach(a => a.classList.toggle('active', a.dataset.spy === e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['indice', 'setups', 'lab'].forEach(id => spy.observe(document.getElementById(id)));

/* ══════════ terminales: foco de luz + inclinación 3D ══════════ */
function bindTerm(term) {
  term.addEventListener('pointermove', e => {
    const r = term.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    term.style.setProperty('--mx', `${x}px`);
    term.style.setProperty('--my', `${y}px`);
    if (e.pointerType !== 'mouse' || reduced) return;
    term.style.setProperty('--ry', `${(x / r.width - .5) * 6}deg`);
    term.style.setProperty('--rx', `${(.5 - y / r.height) * 6}deg`);
  });
  term.addEventListener('pointerleave', () => {
    term.style.setProperty('--rx', '0deg');
    term.style.setProperty('--ry', '0deg');
  });
}

/* ══════════ tema claro / oscuro ══════════ */
const systemDark = matchMedia('(prefers-color-scheme: dark)');
const currentMode = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
const syncMode = () => { root.dataset.mode = currentMode(); };
syncMode();
systemDark.addEventListener('change', syncMode);

function toggleTheme(x, y) {
  const next = currentMode() === 'dark' ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; syncMode(); store.set('theme', next); };
  toast(next === 'dark' ? 'Tema oscuro' : 'Tema claro');
  if (!document.startViewTransition || reduced) return apply();
  if (x == null) { const r = $('#themeBtn').getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate({ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.7,0,.3,1)', pseudoElement: '::view-transition-new(root)' });
  });
}

/* ══════════ modo CRT ══════════ */
const isCRT = () => root.classList.contains('crt');
function setCRT(on, quiet) {
  root.classList.toggle('crt', on);
  $('#crtBtn').setAttribute('aria-pressed', on);
  store.set('crt', on ? '1' : '0');
  if (!quiet) toast(on ? 'Modo CRT activado' : 'Modo CRT desactivado');
}
setCRT(isCRT(), true);

/* ══════════ filtros ══════════ */
function applyFilter(v) {
  if (!VIBES[v]) v = 'all';
  state.filter = v;
  const run = () => {
    $$('#filters .chip').forEach(ch => ch.setAttribute('aria-pressed', ch.dataset.v === v));
    let n = 0;
    SETUPS.forEach(s => {
      const show = v === 'all' || s.vibes.includes(v);
      if (show) n++;
      document.getElementById(s.id).hidden = !show;
      $(`#toc li[data-id="${s.id}"]`).hidden = !show;
    });
    $('#count').textContent = `${pad(n)} / ${pad(SETUPS.length)}`;
  };
  if (!document.startViewTransition || reduced || !state.ready) return run();
  root.classList.add('vt');   // nombres de transición solo mientras se filtra
  document.startViewTransition(run).finished.finally(() => root.classList.remove('vt'));
}
applyFilter('all');

/* ══════════ navegación ══════════ */
function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.hidden) applyFilter('all');
  requestAnimationFrame(() => el.scrollIntoView({ behavior }));
}

function stepSetup(dir) {
  const secs = $$('section.setup:not([hidden])');
  const target = dir > 0
    ? secs.find(s => s.getBoundingClientRect().top > 60)
    : secs.filter(s => s.getBoundingClientRect().top < -20).pop();
  if (!target) return toast(dir > 0 ? 'Ya estás en la última' : 'Ya estás en la primera');
  target.scrollIntoView({ behavior });
  toast(SETUPS.find(s => s.id === target.id).name);
}

/* ══════════ laboratorio ══════════ */
const lab = { theme: 'gruvbox', font: 'jetbrains', prompt: 'h4ck3r', cursor: 'beam', size: 13, fmt: 'kitty' };
const LAB_SOURCES = { theme: THEMES, font: FONTS, prompt: PROMPTS, cursor: CURSORS };
try {
  const q = new URLSearchParams(location.search);
  for (const [k, src] of Object.entries(LAB_SOURCES)) if (src[q.get(k)]) lab[k] = q.get(k);
  const size = +q.get('size');
  if (size >= 11 && size <= 18) lab.size = size;
} catch (e) {}

$('#labControls').innerHTML = [
  ['theme', 'Tema', (k, v) => `<span class="sw" style="--a:${v.bg};--b:${v.ansi[5]}"></span>${esc(v.name)}`],
  ['font', 'Fuente', (k, v) => `<span style="font-family:${v.css}">${esc(v.name)}</span>`],
  ['prompt', 'Prompt', (k, v) => esc(v.name)],
  ['cursor', 'Cursor', (k, v) => esc(v)],
].map(([group, label, fmt]) => `
  <div class="ctl"><span>${label}</span><div class="opts">
    ${Object.entries(LAB_SOURCES[group]).map(([k, v]) => `<button class="chip" data-group="${group}" data-value="${k}" aria-pressed="false">${fmt(k, v)}</button>`).join('')}
  </div></div>`).join('') + `
  <div class="ctl"><span>Tamaño</span><div>
    <input type="range" id="labSize" min="11" max="18" step="1" value="${lab.size}" aria-label="Tamaño de fuente"><output id="labSizeOut">${lab.size} px</output>
  </div></div>`;

function exportConfig() {
  const th = THEMES[lab.theme], f = FONTS[lab.font];
  const names = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
  if (lab.fmt === 'alacritty') return [
    `# ~/.config/alacritty/alacritty.toml · ${th.name}`,
    '[font]', `normal = { family = "${f.name}" }`, `size = ${lab.size}`, '',
    '[cursor.style]', `shape = "${CURSORS_EN[lab.cursor]}"`, '',
    '[colors.primary]', `background = "${th.bg}"`, `foreground = "${th.fg}"`, '',
    '[colors.normal]', ...names.map((n, i) => `${n} = "${th.ansi[i]}"`), '',
    '[colors.bright]', ...names.map((n, i) => `${n} = "${th.ansi[i + 8]}"`),
  ].join('\n');
  if (lab.fmt === 'ghostty') return [
    `# ~/.config/ghostty/config · ${th.name}`,
    `font-family = ${f.name}`, `font-size = ${lab.size}`, `cursor-style = ${lab.cursor === 'beam' ? 'bar' : lab.cursor}`, '',
    `background = ${th.bg.slice(1)}`, `foreground = ${th.fg.slice(1)}`,
    ...th.ansi.map((h, i) => `palette = ${i}=${h}`),
  ].join('\n');
  return [
    `# ~/.config/kitty/kitty.conf · ${th.name}`,
    `font_family      ${f.name}`, `font_size        ${lab.size}`, `cursor_shape     ${lab.cursor}`, '',
    `background       ${th.bg}`, `foreground       ${th.fg}`, `cursor           ${th.fg}`,
    ...th.ansi.map((h, i) => `color${i}${i < 10 ? '  ' : ' '}${h}`),
  ].join('\n');
}
const CURSORS_EN = { beam: 'Beam', block: 'Block', underline: 'Underline' };

const shareUrl = () => location.href.split(/[?#]/)[0] + '?' +
  new URLSearchParams({ theme: lab.theme, font: lab.font, prompt: lab.prompt, cursor: lab.cursor, size: lab.size }) + '#lab';

function renderLab() {
  const th = THEMES[lab.theme], f = FONTS[lab.font];
  const [top, pre] = PROMPTS[lab.prompt].make();
  const term = $('#labTerm');
  term.setAttribute('style', [`--bg:${th.bg}`, `--fg:${th.fg}`, ...th.ansi.map((h, i) => `--c${i}:${h}`),
    `--font:${f.css}`, `--fs:${lab.size}px`].join(';'));
  term.dataset.cursor = lab.cursor;

  const prompt = cmd => (top ? [[top]] : []).concat([[pre + cmd]]);
  const ls = b('c4', 'src/') + '  ' + b('c4', 'docs/') + '  ' + c('c2', 'build.sh') + '  ' + t('README.md') + '  ' + c('c1', 'old.tar.gz');
  const blocks = from => th.ansi.slice(from, from + 8).map((_, i) => c(`c${from + i}`, '███')).join(' ');
  $('#labLines').innerHTML = renderLines([
    ...prompt(t('ls')), [ls], [''],
    ...prompt(t('colors')), [blocks(0)], [blocks(8)], [''],
    ...prompt(cur),
  ]);
  $('#labTitle').textContent = `${th.name} · ${f.name} · ${lab.size}px`;
  $('#labSizeOut').textContent = `${lab.size} px`;
  $$('#labControls .chip').forEach(ch => ch.setAttribute('aria-pressed', lab[ch.dataset.group] === ch.dataset.value));
  $('#labExport').innerHTML = highlight(exportConfig());
  if (state.ready) try { history.replaceState(null, '', shareUrl()); } catch (e) {}
}

function setLab(key, value) {
  lab[key] = value;
  renderLab();
}
$('#labSize').addEventListener('input', e => setLab('size', +e.target.value));
renderLab();

$$('.term').forEach(bindTerm);

/* ══════════ pestañas ══════════ */
function selectTab(tabs, btn) {
  const btns = $$('button', tabs);
  tabs.style.setProperty('--k', btns.indexOf(btn));
  btns.forEach(x => x.setAttribute('aria-selected', x === btn));
}

/* ══════════ paleta de comandos ══════════ */
const cmdk = $('#cmdk'), cmdkInput = $('#cmdkInput'), cmdkList = $('#cmdkList');
let cmdkItems = [], cmdkSel = 0, lastFocus = null;

function commands() {
  return [
    ...SETUPS.map(s => ({ group: 'Configuraciones', label: s.name, hint: s.tag, run: () => goTo(s.id) })),
    { group: 'Ir a', label: 'Índice', run: () => goTo('indice') },
    { group: 'Ir a', label: 'Laboratorio', run: () => goTo('lab') },
    { group: 'Ir a', label: 'Volver arriba', run: () => scrollTo({ top: 0, behavior }) },
    { group: 'Acciones', label: 'Cambiar tema claro / oscuro', hint: 'T', run: () => toggleTheme() },
    { group: 'Acciones', label: `${isCRT() ? 'Desactivar' : 'Activar'} modo CRT`, hint: 'C', run: () => setCRT(!isCRT()) },
    { group: 'Acciones', label: 'Siguiente configuración', hint: 'J', run: () => stepSetup(1) },
    { group: 'Acciones', label: 'Configuración anterior', hint: 'K', run: () => stepSetup(-1) },
    ...Object.entries(VIBES).map(([k, v]) => ({ group: 'Filtrar', label: `Estilo: ${v}`, run: () => { applyFilter(k); goTo('indice'); } })),
    ...Object.entries(THEMES).map(([k, v]) => ({ group: 'Laboratorio', label: `Probar tema ${v.name}`, run: () => { setLab('theme', k); goTo('lab'); } })),
  ];
}

// búsqueda difusa: las letras de la consulta deben aparecer en orden (ignora mayúsculas y tildes)
const fold = s => [...s].map(ch => ch.normalize('NFD')[0].toLowerCase());
function fuzzy(label, query) {
  if (!query) return { html: esc(label), score: 0 };
  const L = fold(label), Q = fold(query).filter(ch => ch !== ' ');
  const chars = [...label];
  let qi = 0, html = '';
  L.forEach((ch, i) => {
    if (qi < Q.length && ch === Q[qi]) { html += `<mark>${esc(chars[i])}</mark>`; qi++; }
    else html += esc(chars[i]);
  });
  if (qi < Q.length) return null;
  return { html, score: L.join('').includes(fold(query).join('')) ? 0 : 1 };
}

function renderCmdk() {
  const q = cmdkInput.value.trim();
  cmdkItems = commands().map(cmd => ({ ...cmd, m: fuzzy(cmd.label, q) })).filter(x => x.m)
    .sort((a, b) => a.m.score - b.m.score);
  cmdkSel = Math.min(cmdkSel, Math.max(cmdkItems.length - 1, 0));
  if (!cmdkItems.length) { cmdkList.innerHTML = '<li class="empty">Sin resultados</li>'; return; }
  let group = '';
  cmdkList.innerHTML = cmdkItems.map((x, i) => {
    const head = x.group !== group ? `<li class="grp" role="presentation">${esc(group = x.group)}</li>` : '';
    return `${head}<li class="item" role="option" id="opt-${i}" data-i="${i}" aria-selected="${i === cmdkSel}">
      <span>${x.m.html}</span>${x.hint ? `<small>${esc(x.hint)}</small>` : ''}</li>`;
  }).join('');
  cmdkInput.setAttribute('aria-activedescendant', `opt-${cmdkSel}`);
}

function openCmdk() {
  lastFocus = document.activeElement;
  cmdk.hidden = false;
  cmdkInput.value = '';
  cmdkSel = 0;
  renderCmdk();
  cmdkInput.focus();
}
function closeCmdk() {
  cmdk.hidden = true;
  lastFocus?.focus?.();
}
function runCmdk(i) {
  const item = cmdkItems[i];
  if (!item) return;
  closeCmdk();
  item.run();
}

cmdkInput.addEventListener('input', () => { cmdkSel = 0; renderCmdk(); });
cmdkInput.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!cmdkItems.length) return;
    cmdkSel = (cmdkSel + (e.key === 'ArrowDown' ? 1 : -1) + cmdkItems.length) % cmdkItems.length;
    renderCmdk();
    $(`#opt-${cmdkSel}`)?.scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') { e.preventDefault(); runCmdk(cmdkSel); }
  else if (e.key === 'Escape') closeCmdk();
});

/* ══════════ atajos de teclado ══════════ */
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); cmdk.hidden ? openCmdk() : closeCmdk(); return; }
  if (!cmdk.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (k === '/' || e.key === '?') { e.preventDefault(); openCmdk(); }
  else if (k === 't') toggleTheme();
  else if (k === 'c') setCRT(!isCRT());
  else if (k === 'j') stepSetup(1);
  else if (k === 'k') stepSetup(-1);
});

/* ══════════ clics (delegación de eventos) ══════════ */
document.addEventListener('click', e => {
  const el = e.target.closest('button, .item, [data-close]');
  if (!el) return;

  if (el.id === 'themeBtn') return toggleTheme(e.clientX || null, e.clientY || null);
  if (el.id === 'crtBtn') return setCRT(!isCRT());
  if (el.id === 'cmdkBtn') return openCmdk();
  if (el.matches('[data-close]')) return closeCmdk();
  if (el.matches('#cmdkList .item')) return runCmdk(+el.dataset.i);

  if (el.matches('#filters .chip')) return applyFilter(el.dataset.v);
  if (el.matches('#labControls .chip')) return setLab(el.dataset.group, el.dataset.value);
  if (el.matches('#exportTabs button')) { selectTab(el.parentElement, el); return setLab('fmt', el.dataset.fmt); }

  if (el.matches('.setup .tabs button')) {
    selectTab(el.parentElement, el);
    $$('.panel', el.closest('.setup')).forEach(p => p.classList.toggle('on', p.dataset.panel === el.dataset.tab));
    return;
  }
  if (el.matches('.swatches button')) { $('.hex', el.parentElement).textContent = el.dataset.hex; return; }

  if (el.matches('button.copy')) {
    const text = el.dataset.copy === 'lab' ? exportConfig()
      : el.dataset.copy === 'link' ? shareUrl()
      : SETUPS[el.dataset.i].install;
    copyInstall(el, text);
  }
});
document.addEventListener('pointerover', e => {
  const sw = e.target.closest?.('.swatches button');
  if (sw) $('.hex', sw.parentElement).textContent = sw.dataset.hex;
});

state.ready = true;

/* ══════════ copiar al portapapeles ══════════ */
function flash(button, label, cls) {
  button.dataset.label ??= button.textContent;
  button.textContent = label;
  button.classList.add(cls);
  clearTimeout(button._t);
  button._t = setTimeout(() => { button.textContent = button.dataset.label; button.classList.remove(cls); }, 1600);
}

async function copyInstall(button, text) {
  // TODO(human): copia `text` al portapapeles y avisa al usuario con flash().
  //   Éxito → flash(button, 'Copiado ✓', 'ok')
  //   Fallo → flash(button, 'Error', 'err')
}
