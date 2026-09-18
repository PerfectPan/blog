import { useEffect, useRef } from 'react';

/**
 * Ambient background, in four switchable variants (review in progress):
 *
 *   1 constellation — drifting dots joined by hairlines, pointer repels them
 *   2 stardust      — layered twinkling dust with pointer parallax
 *   3 rain          — sparse falling glyph columns, terminal matrix-lite
 *   4 aurora        — soft drifting glows in the palette colors
 *
 * Pick with ?particles=1..4 (or the variant name); the choice is kept in
 * localStorage so navigation keeps it. Once a variant is chosen the others
 * get deleted and the switch goes away.
 *
 * Colors come from the CSS custom properties and are re-read whenever
 * <html class> changes, so the dark toggle re-tints every variant for free.
 *
 * Budget guards (all variants): prefers-reduced-motion renders a single
 * static frame, the rAF loop pauses while the tab is hidden, element counts
 * scale with viewport area and stay capped, devicePixelRatio clamps to 2.
 */

type VariantId = 'constellation' | 'stardust' | 'rain' | 'aurora';

const VARIANTS: VariantId[] = ['constellation', 'stardust', 'rain', 'aurora'];
const STORAGE_KEY = 'blog-particles-variant';

function resolveVariant(): VariantId {
  const param = new URLSearchParams(window.location.search).get('particles');
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const valid = (v: string | null): v is VariantId =>
    v !== null && (VARIANTS as string[]).includes(v);
  const pick = valid(param) ? param : valid(stored) ? stored : 'constellation';
  if (valid(param) && param !== stored) {
    window.localStorage.setItem(STORAGE_KEY, pick);
  }
  return pick;
}

type Colors = {
  amber: string;
  faint: string;
  cyan: string;
  green: string;
  violet: string;
  dark: boolean;
};

type Scene = {
  resize: (width: number, height: number) => void;
  step: (time: number) => void;
  draw: (time: number) => void;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Variant 1 — the original: dots + hairline links, pointer repels. */
function makeConstellation(
  ctx: CanvasRenderingContext2D,
  colors: () => Colors,
  pointer: { x: number; y: number },
): Scene {
  type Dot = { x: number; y: number; vx: number; vy: number; r: number };
  const LINK_DIST = 130;
  const REPEL_DIST = 110;
  const EDGE = 20;
  let dots: Dot[] = [];
  let width = 0;
  let height = 0;

  return {
    resize(w, h) {
      width = w;
      height = h;
      const target = clamp(Math.round((w * h) / 22000), 36, 90);
      dots = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.4,
      }));
    },
    step() {
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
        dot.vx = clamp(dot.vx * 0.995, -0.6, 0.6);
        dot.vy = clamp(dot.vy * 0.995, -0.6, 0.6);
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < -EDGE) dot.x = width + EDGE;
        if (dot.x > width + EDGE) dot.x = -EDGE;
        if (dot.y < -EDGE) dot.y = height + EDGE;
        if (dot.y > height + EDGE) dot.y = -EDGE;
      }
    },
    draw() {
      const c = colors();
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
          ctx.strokeStyle = c.faint;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = c.amber;
      for (const dot of dots) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/** Variant 2 — layered twinkling dust; the pointer parallaxes the layers. */
function makeStardust(
  ctx: CanvasRenderingContext2D,
  colors: () => Colors,
  pointer: { x: number; y: number },
): Scene {
  type Star = {
    x: number;
    y: number;
    z: number; // depth 0 (far) .. 1 (near)
    phase: number;
    twinkle: number;
  };
  let stars: Star[] = [];
  let width = 0;
  let height = 0;

  return {
    resize(w, h) {
      width = w;
      height = h;
      const target = clamp(Math.round((w * h) / 14000), 50, 150);
      stars = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.4 + Math.random() * 1.2,
      }));
    },
    step(time) {
      for (const s of stars) {
        // Slow diagonal drift, scaled by depth so near dust moves faster.
        s.x += 0.04 + s.z * 0.1;
        s.y += 0.015 + s.z * 0.04;
        if (s.x > width + 4) s.x = -4;
        if (s.y > height + 4) s.y = -4;
        s.phase += 0.008 * s.twinkle * 60 * (1 / 60);
        void time;
      }
    },
    draw(time) {
      const c = colors();
      const cx = width / 2;
      const cy = height / 2;
      const px = pointer.x > -999 ? (pointer.x - cx) / cx : 0;
      const py = pointer.y > -999 ? (pointer.y - cy) / cy : 0;
      ctx.fillStyle = c.amber;
      for (const s of stars) {
        const tw = 0.55 + 0.45 * Math.sin(s.phase + time * s.twinkle);
        ctx.globalAlpha = (0.1 + s.z * 0.3) * tw;
        const r = 0.5 + s.z * 1.2;
        const ox = px * (2 + s.z * 8);
        const oy = py * (2 + s.z * 8);
        ctx.beginPath();
        ctx.arc(s.x + ox, s.y + oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}

/** Variant 3 — sparse falling glyph columns, a very faint terminal rain. */
function makeRain(
  ctx: CanvasRenderingContext2D,
  colors: () => Colors,
  pointer: { x: number; y: number },
): Scene {
  const GLYPHS = '01·:+*$#>'.split('');
  const FONT = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
  type Column = {
    x: number;
    speed: number;
    head: number;
    tail: number;
    chars: string[];
  };
  let columns: Column[] = [];
  let height = 0;

  const spawn = (x: number): Column => ({
    x,
    speed: 0.6 + Math.random() * 1.6,
    head: Math.random() * -height,
    tail: 6 + Math.floor(Math.random() * 9),
    chars: Array.from(
      { length: 16 },
      () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    ),
  });

  return {
    resize(w, h) {
      height = h;
      const gap = 72;
      const count = clamp(Math.round(w / gap), 6, 26);
      columns = Array.from({ length: count }, (_, i) =>
        spawn((i + 0.5) * (w / count)),
      );
    },
    step() {
      for (const col of columns) {
        col.head += col.speed;
        // Occasionally mutate a tail glyph so columns shimmer.
        if (Math.random() < 0.03) {
          col.chars[Math.floor(Math.random() * col.chars.length)] =
            GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        if (col.head - col.tail * 14 > height) {
          Object.assign(col, spawn(col.x));
        }
      }
      void pointer;
    },
    draw() {
      const c = colors();
      ctx.font = FONT;
      ctx.textAlign = 'center';
      for (const col of columns) {
        for (let i = 0; i < col.tail; i++) {
          const y = col.head - i * 14;
          if (y < -14 || y > height + 14) {
            continue;
          }
          const fade = 1 - i / col.tail;
          const glyph =
            col.chars[(Math.floor(col.head / 14) + i) % col.chars.length];
          if (i === 0) {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = c.amber;
          } else {
            ctx.globalAlpha = 0.16 * fade;
            ctx.fillStyle = c.faint;
          }
          ctx.fillText(glyph, col.x, y);
        }
      }
      ctx.globalAlpha = 1;
    },
  };
}

/** Variant 4 — soft drifting glows; no dots, just slow light. */
function makeAurora(
  ctx: CanvasRenderingContext2D,
  colors: () => Colors,
  pointer: { x: number; y: number },
): Scene {
  type Blob = {
    ax: number; // anchor fraction of width
    ay: number;
    orbit: number; // orbit radius fraction of min(vw,vh)
    speed: number;
    phase: number;
    radius: number; // glow radius px
    color: keyof Omit<Colors, 'dark'>;
    alpha: number;
  };
  const blobs: Blob[] = [
    {
      ax: 0.2,
      ay: 0.3,
      orbit: 0.1,
      speed: 0.05,
      phase: 0,
      radius: 340,
      color: 'amber',
      alpha: 0.075,
    },
    {
      ax: 0.8,
      ay: 0.25,
      orbit: 0.12,
      speed: 0.04,
      phase: 2.1,
      radius: 300,
      color: 'cyan',
      alpha: 0.06,
    },
    {
      ax: 0.55,
      ay: 0.85,
      orbit: 0.09,
      speed: 0.06,
      phase: 4.2,
      radius: 380,
      color: 'violet',
      alpha: 0.05,
    },
  ];
  let width = 0;
  let height = 0;

  return {
    resize(w, h) {
      width = w;
      height = h;
    },
    step() {
      void pointer;
    },
    draw(time) {
      const c = colors();
      ctx.globalCompositeOperation = c.dark ? 'lighter' : 'source-over';
      const min = Math.min(width, height);
      for (const b of blobs) {
        const t = time * b.speed + b.phase;
        const x = b.ax * width + Math.cos(t) * b.orbit * min;
        const y = b.ay * height + Math.sin(t * 1.3) * b.orbit * min;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.radius);
        const color = c[b.color];
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, b.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}

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
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let colors: Colors = {
      amber: '#a8752b',
      faint: '#a6a49a',
      cyan: '#0e7d92',
      green: '#3c7a52',
      violet: '#7a5fa8',
      dark: false,
    };

    const readColors = () => {
      const style = getComputedStyle(document.documentElement);
      const pick = (name: string, fallback: string) =>
        style.getPropertyValue(name).trim() || fallback;
      const dark = document.documentElement.classList.contains('dark');
      colors = {
        amber: pick('--primary', colors.amber),
        faint: pick('--muted-foreground', colors.faint),
        cyan: pick('--chart-1', colors.cyan),
        green: pick('--chart-2', colors.green),
        violet: pick('--chart-3', colors.violet),
        dark,
      };
    };

    const variant = resolveVariant();
    const scene =
      variant === 'constellation'
        ? makeConstellation(ctx, () => colors, pointer)
        : variant === 'stardust'
          ? makeStardust(ctx, () => colors, pointer)
          : variant === 'rain'
            ? makeRain(ctx, () => colors, pointer)
            : makeAurora(ctx, () => colors, pointer);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(width, height);
      if (reduced) {
        scene.draw(0);
      }
    };

    const tick = () => {
      scene.step(performance.now() / 1000);
      scene.draw(performance.now() / 1000);
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
    // palette values.
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
      className='pointer-events-none fixed inset-0 z-0'
    />
  );
}
