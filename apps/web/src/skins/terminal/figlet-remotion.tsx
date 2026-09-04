import { Player } from '@remotion/player';
import { FIGLET_ANIMATION, FigletAnimation } from './figlet-animation.js';
import type { FigletMetrics } from './figlet-player.js';

/**
 * Remotion-backed home hero. Lives in its own lazy chunk (loaded via
 * FigletPlayer after hydration) because the player runtime is far too heavy
 * for the main bundle on the 3 MiB-gzip Worker budget. The composition box
 * mirrors the measured static <pre> 1:1; the layer is absolutely positioned
 * over the static art (which stays visible underneath), so a blocked or
 * throttled autoplay can never leave the hero blank.
 */
export function AnimatedFiglet({
  art,
  suffix,
  metrics,
}: {
  art: string;
  suffix: string;
  metrics: FigletMetrics;
}) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden='true'
    >
      <Player
        component={FigletAnimation}
        inputProps={{ art, suffix }}
        durationInFrames={FIGLET_ANIMATION.durationInFrames}
        fps={FIGLET_ANIMATION.fps}
        compositionWidth={metrics.width}
        compositionHeight={metrics.height}
        autoPlay
        loop={false}
        controls={false}
        clickToPlay={false}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          fontFamily: 'var(--t-mono)',
          fontSize: metrics.fontSize,
          lineHeight: metrics.lineHeight,
          color: 'var(--t-faint)',
          userSelect: 'none',
        }}
      />
    </div>
  );
}
