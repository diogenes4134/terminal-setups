import { reduced } from './dom';

/* ══════════ horizonte animado del hero ══════════
   Un planeta enorme cuyo borde es el horizonte, con atmósfera, un amanecer que respira,
   una rejilla en perspectiva que avanza y unas pocas estrellas. Todo en un canvas 2D. */

const STARS = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 0.9 + 0.3, p: Math.random() * Math.PI * 2 }));

/** Arranca el horizonte en `canvas`. Devuelve una promesa que se cumple tras el primer fotograma. */
export function initHorizon(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve();

  let W = 0, H = 0, raf = 0, visible = true, last = performance.now(), t = 0;
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };   // desplazamiento del punto de fuga con el ratón
  let markReady: () => void;
  const ready = new Promise<void>(r => (markReady = r));

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    if (!W || !H) return;
    const c = ctx!;
    const hy = H * 0.3 + tilt.y;                  // altura del horizonte
    const cx = W / 2 + tilt.x;                    // centro (punto de fuga)
    const R = Math.max(W * 1.5, 1500);            // radio del planeta: curva muy suave
    const cy = hy + R;
    const breathe = reduced ? 1 : 0.88 + 0.12 * Math.sin(t * 0.45);
    c.clearRect(0, 0, W, H);

    // estrellas en el cielo
    for (const s of STARS) {
      const y = s.y * hy * 0.92;
      if (y > hy - 6) continue;
      c.globalAlpha = (0.25 + 0.35 * (reduced ? 1 : 0.5 + 0.5 * Math.sin(t * 0.8 + s.p))) * Math.min(1, y / (hy * 0.35));
      c.fillStyle = '#dbeeff';
      c.beginPath(); c.arc(s.x * W, y, s.r, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;

    // atmósfera: elipse azul sobre el horizonte
    c.save();
    c.translate(cx, hy); c.scale(1, 0.22);
    const atm = c.createRadialGradient(0, 0, 0, 0, 0, W * 0.62);
    atm.addColorStop(0, `rgba(86, 168, 255, ${0.26 * breathe})`);
    atm.addColorStop(0.45, 'rgba(40, 96, 220, 0.08)');
    atm.addColorStop(1, 'rgba(10, 30, 90, 0)');
    c.fillStyle = atm; c.fillRect(-W * 2, -W * 0.7, W * 4, W * 1.4);
    c.restore();

    // superficie del planeta
    c.save();
    c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.clip();
    const ground = c.createLinearGradient(0, hy, 0, H);
    ground.addColorStop(0, '#0b1f52'); ground.addColorStop(0.18, '#04103a'); ground.addColorStop(1, '#01061a');
    c.fillStyle = ground; c.fillRect(0, hy - 4, W, H - hy + 4);

    // rejilla en perspectiva: líneas horizontales que se acercan…
    const depth = H - hy, speed = reduced ? 0 : t * 0.35;
    for (let i = 0; i < 28; i++) {
      const d = i + 1 - (speed % 1);              // distancia (1 = la más cercana)
      const y = hy + (depth * 1.6) / d - depth * 0.04;
      if (y < hy || y > H) continue;
      const near = (y - hy) / depth;              // 0 en el horizonte, 1 abajo
      c.strokeStyle = `rgba(127, 212, 255, ${0.03 + 0.13 * near * near})`;
      c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); c.stroke();
    }
    // …y líneas que convergen en el punto de fuga
    const fade = c.createLinearGradient(0, hy, 0, H);
    fade.addColorStop(0, 'rgba(127, 212, 255, 0)'); fade.addColorStop(1, 'rgba(127, 212, 255, 0.16)');
    c.strokeStyle = fade;
    for (let j = -18; j <= 18; j++) {
      c.beginPath(); c.moveTo(cx + j * 6, hy); c.lineTo(cx + j * W * 0.075, H); c.stroke();
    }
    c.restore();

    // borde del planeta: línea brillante que se apaga hacia los lados
    const rim = c.createLinearGradient(0, 0, W, 0);
    rim.addColorStop(0, 'rgba(150, 215, 255, 0)');
    rim.addColorStop(0.5, `rgba(190, 232, 255, ${0.95 * breathe})`);
    rim.addColorStop(1, 'rgba(150, 215, 255, 0)');
    c.save();
    c.shadowColor = 'rgba(110, 190, 255, 0.9)'; c.shadowBlur = 16;
    c.strokeStyle = rim; c.lineWidth = 1.3;
    c.beginPath(); c.arc(cx, cy, R, Math.PI * 1.25, Math.PI * 1.75); c.stroke();
    c.restore();

    // amanecer en el centro
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.translate(cx, hy); c.scale(1, 0.4);
    const sun = c.createRadialGradient(0, 0, 0, 0, 0, Math.min(W * 0.22, 260));
    sun.addColorStop(0, `rgba(210, 238, 255, ${0.55 * breathe})`);
    sun.addColorStop(0.25, `rgba(120, 190, 255, ${0.22 * breathe})`);
    sun.addColorStop(1, 'rgba(60, 120, 255, 0)');
    c.fillStyle = sun; c.fillRect(-W, -400, W * 2, 800);
    c.restore();
  }

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now; t += dt;
    tilt.x += (tilt.tx - tilt.x) * 0.04;
    tilt.y += (tilt.ty - tilt.y) * 0.04;
    draw();
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  const play = () => { if (!raf && !reduced && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  new ResizeObserver(resize).observe(canvas);
  resize();
  markReady!();

  if (!reduced) {
    new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; play(); }).observe(canvas);
    document.addEventListener('visibilitychange', play);
    addEventListener('pointermove', e => {
      tilt.tx = (e.clientX / innerWidth - 0.5) * W * 0.05;
      tilt.ty = (e.clientY / innerHeight - 0.5) * H * 0.04;
    }, { passive: true });
    play();
  }
  return ready;
}
