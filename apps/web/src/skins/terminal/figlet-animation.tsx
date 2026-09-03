import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

type FigletAnimationProps = {
  /** Raw ASCII art, line-separated. */
  art: string;
  /** Highlighted suffix rendered after the last line (e.g. "org"). */
  suffix: string;
};

/** One-shot hero reveal timings, exported so the Player wiring matches. */
export const FIGLET_ANIMATION = { fps: 30, durationInFrames: 150 };

/*
 * One-shot terminal hero reveal: the figlet lines stagger in with a fast
 * settle (soft overshoot), then a block cursor appears after the highlighted
 * suffix and blinks forever. Pure HTML frames — no canvas, no video.
 */
export function FigletAnimation({ art, suffix }: FigletAnimationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = art.split('\n');
  const firstFrame = 8;
  const stagger = 7;
  const settle = 22;
  const lastLine = lines.length - 1;

  const revealDone = firstFrame + lastLine * stagger + settle;
  const cursorT = frame - revealDone;
  // Cursor solid while waiting, then a 3-phase blink (on/on/off) forever.
  const cursorVisible =
    cursorT < 0 ? true : Math.floor(cursorT / (0.45 * fps)) % 3 !== 2;

  return (
    <AbsoluteFill style={{ whiteSpace: 'pre' }}>
      {lines.map((line, i) => {
        // Fast quadratic rise with a slight overshoot, settled by `settle`;
        // clamped so lines still waiting render fully transparent at rest.
        const t = Math.max(frame - (firstFrame + i * stagger), 0);
        const p = Math.min(t / settle, 1);
        const eased = 1 - (1 - p) * (1 - p);
        const overshoot = Math.sin(p * Math.PI) * 0.04;
        return (
          <div
            key={line}
            style={{
              lineHeight: 1.25,
              opacity: eased,
              transform: `translateY(${(1 - eased) * 6 - overshoot * 10}px)`,
            }}
          >
            {line}
            {i === lastLine ? (
              <>
                <span style={{ color: 'var(--t-amber)' }}>{suffix}</span>
                <span
                  style={{
                    color: 'var(--t-amber)',
                    opacity: cursorVisible ? 1 : 0,
                  }}
                >
                  ▌
                </span>
              </>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
