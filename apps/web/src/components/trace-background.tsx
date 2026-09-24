import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { createWave, DOT_PITCH } from './dot-wave.js';

/**
 * Site backdrop: branches that grow in from the viewport edges, after
 * antfu.me's "plum", but snapped to an 8-direction grid so they read as
 * circuit traces / `git log --graph` lines rather than twigs. Each tip steps
 * one grid cell per tick, sometimes turns 45°, sometimes forks, and ends in a
 * small square node.
 *
 * Traces grow in the gutters beside the content column, measured from the
 * <Page> container (`data-page`). The column is a soft wall: now and then a
 * trace runs in, but it cannot fork there and ends sooner than in the
 * gutters, and the mask fades it to a sixth of full strength — enough to tie the two
 * sides together without lines running across the text. When the gutters
 * are too narrow to hold a trace (phones), the backdrop switches to the
 * rolling dot-grid surface in dot-wave.ts, dimmed toward the center. Routes
 * without a <Page> (admin) draw nothing. Moving between pages that share
 * the column keeps the drawing as is.
 *
 * Colors are read from the theme tokens at draw time; a class change on
 * <html> (the dark-mode toggle) repaints every stored segment in the new
 * palette. Reduced-motion users get the finished drawing with no growth.
 */

// Grid pitch in CSS px — one step of a trace.
const STEP = 9;
// Ticks advance on every Nth animation frame (~20 steps/s at 60fps).
const FRAMES_PER_TICK = 3;
// Steps a branch always takes before it may die.
const MIN_DEPTH = 6;
// Share of gutter cells the whole drawing may cover.
const COVERAGE = 0.09;
// Roots on each gutter's outer edge (top and bottom get one each).
const ROOTS_PER_EDGE = 2;
// Per-step odds: survival (minus a per-depth decay), 45° turn, fork.
const SURVIVE = 0.985;
const SURVIVE_DECAY = 0.0006;
const TURN = 0.12;
const FORK = 0.035;
// Clearance in px between the gutters and the column's text box.
const CLEARANCE = 16;
// Odds a trace at the column's edge continues into it (per attempt), and
// per-step survival once inside (mean ~25 steps before it ends).
const ENTER_COLUMN = 0.5;
const SURVIVE_IN_COLUMN = 0.96;
// Mask strength at the column's edge and inside it.
const MASK_EDGE = 0.35;
const MASK_COLUMN = 0.15;
// Width in px over which the mask eases from the edge to the column value.
const MASK_FADE = 120;
// Gutters narrower than this many cells are left empty.
const MIN_GUTTER = 6;
// The dot wave redraws at most this often: its motion is slow, and a
// frame-count throttle would still run at 60fps on 120Hz displays.
const DOT_FRAME_MS = 33;

const DIRS: readonly [number, number][] = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

type Tip = { x: number; y: number; dir: number; depth: number };

type Drawing = {
  // Flat [x1, y1, x2, y2, ...] in grid units.
  segments: number[];
  // Flat [x, y, ...] in grid units.
  nodes: number[];
};

/** Grid columns [lo, hi] (inclusive) of the column, which traces rarely enter. */
type Wall = { lo: number; hi: number };

function createGrower(cols: number, rows: number, wall: Wall) {
  const occupied = new Uint8Array(cols * rows);
  const drawing: Drawing = { segments: [], nodes: [] };
  const inWall = (x: number) => x >= wall.lo && x <= wall.hi;

  // Roots per usable gutter: its outer edge pointing inward, plus one on the
  // top and bottom edge inside the gutter, each with a little angular jitter.
  const jitter = () => (Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : 7);
  const at = (lo: number, hi: number) =>
    Math.round(lo + (0.15 + Math.random() * 0.7) * (hi - lo));
  const gutters = [
    { lo: 0, hi: wall.lo - 1, edge: 0, inward: 0 },
    { lo: wall.hi + 1, hi: cols - 1, edge: cols - 1, inward: 4 },
  ].filter((g) => g.hi - g.lo + 1 >= MIN_GUTTER);
  let tips: Tip[] = [];
  let cells = 0;
  for (const g of gutters) {
    cells += (g.hi - g.lo + 1) * rows;
    for (let i = 0; i < ROOTS_PER_EDGE; i++) {
      tips.push({
        x: g.edge,
        y: at(0, rows - 1),
        dir: (g.inward + jitter()) % 8,
        depth: 0,
      });
    }
    tips.push(
      { x: at(g.lo, g.hi), y: 0, dir: (2 + jitter()) % 8, depth: 0 },
      { x: at(g.lo, g.hi), y: rows - 1, dir: (6 + jitter()) % 8, depth: 0 },
    );
  }
  const budget = Math.round(cells * COVERAGE);
  for (const t of tips) {
    occupied[t.y * cols + t.x] = 1;
  }

  const open = (x: number, y: number, mayEnter: boolean) =>
    x >= 0 &&
    y >= 0 &&
    x < cols &&
    y < rows &&
    occupied[y * cols + x] === 0 &&
    (mayEnter || !inWall(x));

  // Heading, else a 45° then 90° swerve (random side first) — traces route
  // along the column and around each other instead of dying on contact.
  const route = (t: Tip) => {
    const side = Math.random() < 0.5 ? 1 : 7;
    const mayEnter = inWall(t.x) || Math.random() < ENTER_COLUMN;
    for (const turn of [0, side, 8 - side, side * 2, 16 - side * 2]) {
      const dir = (t.dir + turn) % 8;
      const [dx, dy] = DIRS[dir];
      if (open(t.x + dx, t.y + dy, mayEnter)) {
        return dir;
      }
    }
    return -1;
  };

  /** Advance every live tip one step; returns false once growth is over. */
  function tick(): boolean {
    const next: Tip[] = [];
    for (const t of tips) {
      const heading = drawing.segments.length / 4 >= budget ? -1 : route(t);
      if (heading < 0) {
        // Roots that never moved get no end node.
        if (t.depth > 0) {
          drawing.nodes.push(t.x, t.y);
        }
        continue;
      }
      const [dx, dy] = DIRS[heading];
      const nx = t.x + dx;
      const ny = t.y + dy;
      occupied[ny * cols + nx] = 1;
      drawing.segments.push(t.x, t.y, nx, ny);

      const depth = t.depth + 1;
      const inside = inWall(nx);
      let spawned = false;
      // Survival decays with depth so branches stay near their edge.
      if (
        inside
          ? Math.random() < SURVIVE_IN_COLUMN
          : depth < MIN_DEPTH || Math.random() < SURVIVE - depth * SURVIVE_DECAY
      ) {
        const turn = Math.random();
        const dir =
          turn < TURN / 2
            ? (heading + 1) % 8
            : turn < TURN
              ? (heading + 7) % 8
              : heading;
        next.push({ x: nx, y: ny, dir, depth });
        spawned = true;
      }
      if (!inside && Math.random() < FORK) {
        // Forks leave at 45° or 90° to the parent.
        const offset = [1, 2, 6, 7][Math.floor(Math.random() * 4)];
        next.push({ x: nx, y: ny, dir: (heading + offset) % 8, depth });
        spawned = true;
      }
      if (!spawned) {
        drawing.nodes.push(nx, ny);
      }
    }
    tips = next;
    return tips.length > 0;
  }

  return { drawing, tick };
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    line: style.getPropertyValue('--muted-foreground').trim(),
    node: style.getPropertyValue('--primary').trim(),
  };
}

function paint(
  ctx: CanvasRenderingContext2D,
  drawing: Drawing,
  colors: ReturnType<typeof readColors>,
  fromSegment: number,
  fromNode: number,
) {
  const half = STEP / 2;
  const { segments, nodes } = drawing;

  ctx.strokeStyle = colors.line;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = fromSegment; i < segments.length; i += 4) {
    ctx.moveTo(segments[i] * STEP + half, segments[i + 1] * STEP + half);
    ctx.lineTo(segments[i + 2] * STEP + half, segments[i + 3] * STEP + half);
  }
  ctx.stroke();

  ctx.fillStyle = colors.node;
  ctx.globalAlpha = 0.7;
  for (let i = fromNode; i < nodes.length; i += 2) {
    ctx.fillRect(
      nodes[i] * STEP + half - 1.5,
      nodes[i + 1] * STEP + half - 1.5,
      3,
      3,
    );
  }
}

/** The content column's text box in px, or null when the route has none. */
function measureColumn(): { left: number; right: number } | null {
  const page = document.querySelector<HTMLElement>('[data-page]');
  if (!page) {
    return null;
  }
  const rect = page.getBoundingClientRect();
  const style = getComputedStyle(page);
  return {
    left: rect.left + Number.parseFloat(style.paddingLeft),
    right: rect.right - Number.parseFloat(style.paddingRight),
  };
}

export function TraceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const syncRef = useRef<() => void>(() => {});
  // Settles only after the new route has rendered, so its <Page> is in the
  // DOM when the sync effect measures.
  const resolvedHref = useRouterState({
    select: (s) => s.resolvedLocation?.href,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let frame = 0;
    let dpr = 1;
    // Redraws the current mode in the current palette (theme toggle).
    let repaint = () => {};
    // What the current drawing was grown for; a change regrows it.
    let key = '';

    const clear = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const start = (
      w: number,
      h: number,
      column: { left: number; right: number } | null,
    ) => {
      cancelAnimationFrame(frame);
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      clear();
      canvas.style.maskImage = '';
      repaint = clear;
      if (!column) {
        return;
      }
      const left = column.left - CLEARANCE;
      const right = column.right + CLEARANCE;
      if (Math.min(left, w - right) / STEP >= MIN_GUTTER) {
        startTraces(w, h, left, right);
      } else {
        startDots(w, h);
      }
    };

    const startTraces = (w: number, h: number, left: number, right: number) => {
      // Fade toward the column; the few traces inside stay faint.
      canvas.style.maskImage = `linear-gradient(90deg, #000, rgb(0 0 0 / ${MASK_EDGE}) ${left}px, rgb(0 0 0 / ${MASK_COLUMN}) ${left + MASK_FADE}px, rgb(0 0 0 / ${MASK_COLUMN}) ${right - MASK_FADE}px, rgb(0 0 0 / ${MASK_EDGE}) ${right}px, #000)`;
      const grower = createGrower(Math.ceil(w / STEP), Math.ceil(h / STEP), {
        // Cell x's trace point sits at x * STEP + STEP / 2.
        lo: Math.floor(left / STEP),
        hi: Math.ceil(right / STEP),
      });
      const { drawing } = grower;
      let colors = readColors();
      // Painting everything again also covers the not-yet-painted tail, so
      // the loop's cursors staying behind only means a harmless re-stroke.
      repaint = () => {
        colors = readColors();
        clear();
        paint(ctx, drawing, colors, 0, 0);
      };

      if (reduceMotion) {
        while (grower.tick()) {
          // Grow to completion synchronously.
        }
        repaint();
        return;
      }

      let count = 0;
      let seg = 0;
      let node = 0;
      const loop = () => {
        count += 1;
        let alive = true;
        if (count % FRAMES_PER_TICK === 0) {
          alive = grower.tick();
          paint(ctx, drawing, colors, seg, node);
          seg = drawing.segments.length;
          node = drawing.nodes.length;
        }
        if (alive) {
          frame = requestAnimationFrame(loop);
        }
      };
      frame = requestAnimationFrame(loop);
    };

    const startDots = (w: number, h: number) => {
      const draw = createWave(
        Math.ceil(w / DOT_PITCH),
        Math.ceil(h / DOT_PITCH),
      );
      let color = readColors().line;
      const t0 = performance.now();
      let t = 0;
      repaint = () => {
        color = readColors().line;
        draw(ctx, color, t);
      };

      if (reduceMotion) {
        repaint();
        return;
      }

      let last = -Infinity;
      const loop = (now: number) => {
        if (now - last >= DOT_FRAME_MS) {
          last = now;
          t = (now - t0) / 1000;
          draw(ctx, color, t);
        }
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    };

    // The canvas is 100lvh tall — the viewport with mobile toolbars
    // retracted — so toolbars showing or hiding while scrolling leave its
    // size alone; only a real size change or a moved column regrows.
    const sync = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const column = measureColumn();
      const next = column
        ? `${w}x${h}:${Math.round(column.left)}:${Math.round(column.right)}`
        : `${w}x${h}:none`;
      if (next !== key) {
        key = next;
        start(w, h, column);
      }
    };
    syncRef.current = sync;
    sync();

    // Theme toggle flips html.dark: repaint what exists in the new palette.
    const observer = new MutationObserver(() => repaint());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sync, 200);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      syncRef.current = () => {};
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resolvedHref is the trigger — each settled navigation re-measures the column.
  useEffect(() => {
    syncRef.current();
  }, [resolvedHref]);

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none fixed top-0 left-0 -z-10 h-lvh w-full'
    />
  );
}
