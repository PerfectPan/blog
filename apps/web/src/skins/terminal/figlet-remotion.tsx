import { Player } from '@remotion/player';
import { FIGLET_ANIMATION, FigletAnimation } from './figlet-animation.js';
import type { FigletMetrics } from './figlet-player.js';

/**
 * Remotion-backed home hero. Lives in its own lazy chunk (loaded via
 * FigletPlayer after hydration) because the player runtime is far too heavy
 * for the main bundle on the 3 MiB-gzip Worker budget. The composition box
 * mirrors the measured static <pre> 1:1, so font sizes and layout match the
 * static render exactly (including responsive font tweaks).
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
    <Player
      component={FigletAnimation}
      inputProps={{ art, suffix }}
      durationInFrames={FIGLET_ANIMATION.durationInFrames}
      fps={FIGLET_ANIMATION.fps}
      compositionWidth={metrics.width}
      compositionHeight={metrics.height}
      loop={false}
      controls={false}
      style={{
        width: metrics.width,
        height: metrics.height,
        marginTop: metrics.marginTop,
        fontFamily: 'var(--t-mono)',
        fontSize: metrics.fontSize,
        lineHeight: metrics.lineHeight,
        color: 'var(--t-faint)',
        userSelect: 'none',
      }}
    />
  );
}
