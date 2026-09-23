/**
 * Narrow-viewport backdrop mode for trace-background.tsx: a dot grid read as
 * a slowly rolling 3D surface. A height field (two crossing plane waves plus
 * a ripple from a drifting center) sets each dot's size and brightness —
 * crests swell, troughs sink nearly out of sight — and a fixed light from
 * the top-left brightens the slopes that face it, which is what makes the
 * surface read as bulging and caving rather than just pulsing. Dots also
 * shift a little down the slope, like a lens over the grid.
 *
 * Kept deliberately faint: one neutral token color, low alpha, slow motion.
 */

// Grid pitch in CSS px — one dot per cell.
export const DOT_PITCH = 16;
// Alpha range from deepest trough to brightest lit crest.
const ALPHA_MIN = 0.04;
const ALPHA_MAX = 0.26;
// Dot size range in px.
const SIZE_MIN = 0.8;
const SIZE_MAX = 2.4;
// Dot shift down the slope, in cells per unit of gradient; gradients peak
// near 0.15, so dots move at most ~4px.
const SHIFT = 1.6;
// Light direction (normalized, pointing from the top-left).
const LIGHT_X = -0.6;
const LIGHT_Y = -0.8;
// Alpha is bucketed so each frame issues a handful of fills, not thousands.
const BUCKETS = 8;
// Dots sit behind the text on phones, so alpha scales down toward the
// middle: DIM_CENTER inside DIM_INNER of the half-diagonal, full past
// DIM_OUTER, linear between.
const DIM_CENTER = 0.2;
const DIM_INNER = 0.25;
const DIM_OUTER = 0.85;

/**
 * Height in [-1, 1] and its gradient at grid cell (x, y), time t (seconds).
 * Wave numbers are per cell; speeds are slow enough that one crest takes
 * several seconds to cross a phone screen.
 */
function surface(x: number, y: number, t: number, cx: number, cy: number) {
  const a1 = 0.21 * x + 0.13 * y - 0.55 * t;
  const a2 = -0.09 * x + 0.19 * y - 0.35 * t;
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
  const a3 = 0.32 * d - 0.9 * t;
  // Weights sum to 1 so the height stays within [-1, 1].
  const h = 0.45 * Math.sin(a1) + 0.3 * Math.sin(a2) + 0.25 * Math.sin(a3);
  const c1 = 0.45 * Math.cos(a1);
  const c2 = 0.3 * Math.cos(a2);
  const c3 = (0.25 * 0.32 * Math.cos(a3)) / d;
  return {
    h,
    gx: c1 * 0.21 - c2 * 0.09 + c3 * dx,
    gy: c1 * 0.13 + c2 * 0.19 + c3 * dy,
  };
}

/** Returns a painter for a cols x rows board; call it with the time in s. */
export function createWave(cols: number, rows: number) {
  const dim = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const r =
        Math.sqrt(((x / cols) * 2 - 1) ** 2 + ((y / rows) * 2 - 1) ** 2) /
        Math.SQRT2;
      const k = Math.min(
        1,
        Math.max(0, (r - DIM_INNER) / (DIM_OUTER - DIM_INNER)),
      );
      dim[y * cols + x] = DIM_CENTER + (1 - DIM_CENTER) * k;
    }
  }
  const half = DOT_PITCH / 2;

  return (ctx: CanvasRenderingContext2D, color: string, t: number) => {
    // The ripple's center drifts on a slow Lissajous path across the board.
    const cx = cols * (0.5 + 0.35 * Math.sin(t * 0.07));
    const cy = rows * (0.5 + 0.35 * Math.sin(t * 0.05 + 1.3));
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const s = surface(x, y, t, cx, cy);
        const height = (s.h + 1) / 2;
        // Slope facing the light, in [0, 1]; scaled because gradients are small.
        const lit = Math.min(
          1,
          Math.max(0, -(s.gx * LIGHT_X + s.gy * LIGHT_Y) * 3 + 0.5),
        );
        const tone = height * 0.65 + lit * 0.35;
        const alpha =
          (ALPHA_MIN + (ALPHA_MAX - ALPHA_MIN) * tone) * dim[y * cols + x];
        const bucket = Math.min(
          BUCKETS - 1,
          Math.floor((alpha / ALPHA_MAX) * BUCKETS),
        );
        const size = SIZE_MIN + (SIZE_MAX - SIZE_MIN) * height;
        paths[bucket].rect(
          x * DOT_PITCH + half - s.gx * SHIFT * DOT_PITCH - size / 2,
          y * DOT_PITCH + half - s.gy * SHIFT * DOT_PITCH - size / 2,
          size,
          size,
        );
      }
    }

    ctx.clearRect(0, 0, cols * DOT_PITCH, rows * DOT_PITCH);
    ctx.fillStyle = color;
    for (let b = 0; b < BUCKETS; b++) {
      ctx.globalAlpha = (ALPHA_MAX * (b + 0.5)) / BUCKETS;
      ctx.fill(paths[b]);
    }
  };
}
