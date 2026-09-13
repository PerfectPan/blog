import { useEffect, useRef } from 'react';

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const LINK_DIST = 130;
const REPEL_DIST = 110;
const EDGE = 20;

/**
 * Ambient background: a sparse constellation of slowly drifting dots joined
 * by hairlines — antfu.me-style, tuned to the terminal palette (--t-amber
 * dots, --t-faint lines) instead of generic blue. One fixed canvas behind
 * the app shell; colors are re-read from the CSS custom properties whenever
 * <html class> changes, so the dark toggle re-tints it for free.
 *
 * Budget guards: prefers-reduced-motion renders a single static frame, the
 * rAF loop pauses while the tab is hidden, dots scale with viewport area
 * (36–90) and devicePixelRatio is clamped to 2.
 */
export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const pointer = { x: -9999, y: -9999 };
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dotColor = '#a8752b';
    let lineColor = '#a6a49a';
    let raf = 0;
    let running = false;

    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      dotColor = style.getPropertyValue('--t-amber').trim() || dotColor;
      lineColor = style.getPropertyValue('--t-faint').trim() || lineColor;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(
        90,
        Math.max(36, Math.round((width * height) / 22000)),
      );
      dots = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.4,
      }));
      if (reduced) {
        render();
      }
    };

    const advance = () => {
      for (const dot of dots) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < REPEL_DIST * REPEL_DIST && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const push = ((REPEL_DIST - dist) / REPEL_DIST) * 0.6;
          dot.vx += (dx / dist) * push;
          dot.vy += (dy / dist) * push;
        }
        // Gentle speed ceiling so pointer pushes don't accumulate forever.
        dot.vx = Math.max(-0.6, Math.min(0.6, dot.vx * 0.995));
        dot.vy = Math.max(-0.6, Math.min(0.6, dot.vy * 0.995));
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < -EDGE) dot.x = width + EDGE;
        if (dot.x > width + EDGE) dot.x = -EDGE;
        if (dot.y < -EDGE) dot.y = height + EDGE;
        if (dot.y > height + EDGE) dot.y = -EDGE;
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > LINK_DIST * LINK_DIST) {
            continue;
          }
          const dist = Math.sqrt(distSq);
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.16;
          ctx.strokeStyle = lineColor;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = dotColor;
      for (const dot of dots) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      advance();
      render();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || reduced) {
        return;
      }
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    readColors();
    resize();

    // Re-tint on the dark toggle: the class flip changes the resolved
    // --t-amber / --t-faint values.
    const classObserver = new MutationObserver(readColors);
    classObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('resize', resize);
    if (!reduced) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerleave', onPointerLeave);
      document.addEventListener('visibilitychange', onVisibility);
      start();
    }

    return () => {
      stop();
      classObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden='true'
      tabIndex={-1}
      className='th-particles'
    />
  );
}
