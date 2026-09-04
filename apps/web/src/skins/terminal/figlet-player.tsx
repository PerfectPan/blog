import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// Everything Remotion (player + runtime) lives behind this boundary so the
// main worker chunk never pulls it in; it is only fetched after hydration.
const AnimatedFiglet = lazy(() =>
  import('./figlet-remotion.js').then((m) => ({ default: m.AnimatedFiglet })),
);

export type FigletMetrics = {
  width: number;
  height: number;
  fontSize: string;
  lineHeight: string;
  marginTop: string;
};

/**
 * The home hero figlet. The static art is ALWAYS rendered (server, pre-
 * hydration, and as the base layer afterwards); once mounted — and only
 * when the user is OK with motion — the Remotion player is layered on top
 * of it with a 1:1 composition box and plays the reveal once. If the player
 * is slow to load or rAF-throttled, the static art simply stays visible:
 * the hero can never go blank. Clicking the hero replays the animation.
 */
export function FigletPlayer({ art, suffix }: { art: string; suffix: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [metrics, setMetrics] = useState<FigletMetrics | null>(null);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const el = preRef.current;
    if (!el) {
      return;
    }
    const cs = getComputedStyle(el);
    setMetrics({
      width: el.offsetWidth,
      height: el.offsetHeight,
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      marginTop: cs.marginTop,
    });
  }, []);

  return (
    // The static art stays in flow (owns the height, zero layout shift);
    // the player is a transparent overlay that draws the animated lines
    // over the identical static glyphs.
    <div
      style={{ position: 'relative', cursor: metrics ? 'pointer' : undefined }}
      title={metrics ? '点击重播动画' : undefined}
      aria-hidden='true'
      onClick={
        metrics
          ? () => {
              setRunId((n) => n + 1);
            }
          : undefined
      }
    >
      <pre ref={preRef} className='th-figlet'>
        {art}
        <b>{suffix}</b>
      </pre>
      {metrics ? (
        <Suspense fallback={null}>
          <AnimatedFiglet
            key={runId}
            art={art}
            suffix={suffix}
            metrics={metrics}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
