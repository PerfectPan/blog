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
 * The home hero figlet. Renders the identical static art on the server and
 * before hydration; after mount (and only when the user is OK with motion)
 * measures the static <pre> and swaps in the Remotion player with a 1:1
 * composition box, so the swap is pixel-stable at any viewport width.
 */
export function FigletPlayer({ art, suffix }: { art: string; suffix: string }) {
  const preRef = useRef<HTMLPreElement>(null);
  const [metrics, setMetrics] = useState<FigletMetrics | null>(null);

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

  const staticArt = (
    <pre ref={preRef} className='th-figlet' aria-hidden='true'>
      {art}
      <b>{suffix}</b>
    </pre>
  );

  if (!metrics) {
    return staticArt;
  }

  return (
    <Suspense fallback={staticArt}>
      <AnimatedFiglet art={art} suffix={suffix} metrics={metrics} />
    </Suspense>
  );
}
