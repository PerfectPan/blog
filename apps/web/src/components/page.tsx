import { Children, type CSSProperties, type ReactNode } from 'react';

/**
 * The single content container for every terminal-skin page. Owns the page
 * width decision (max-w) and the responsive gutters — pages never set their
 * own width. `className` lets a page add a typography scope without wrapping
 * in another container. The 640–1100px band widens the gutter so the column
 * reads as centered before the 880px max-width binds.
 */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      // Marks the content column for the site backdrop (trace-background.tsx),
      // which keeps its traces out of this box.
      data-page=''
      className={
        className
          ? `mx-auto w-full max-w-220 px-5.5 pt-6.5 pb-11.5 min-[640px]:max-[1100px]:px-11 ${className}`
          : 'mx-auto w-full max-w-220 px-5.5 pt-6.5 pb-11.5 min-[640px]:max-[1100px]:px-11'
      }
    >
      {children}
    </div>
  );
}

// Typing speed for `typed` prompts: per character, capped so long commands
// (article slugs) still finish quickly.
const TYPE_MS_PER_CHAR = 20;
const TYPE_MS_MAX = 450;

/** The command as plain text, or null when children hold elements. */
function commandText(children: ReactNode): string | null {
  let text = '';
  for (const child of Children.toArray(children)) {
    if (typeof child !== 'string' && typeof child !== 'number') {
      return null;
    }
    text += child;
  }
  return text;
}

/**
 * The simulated-shell prompt line every page (and some sections) opens
 * with: user @ host cwd % command. Shared so its size and rhythm stay
 * identical everywhere — it inherits the body size, never sets one.
 * Omit `user` for continuation lines that start straight at the cwd.
 * `typed` types a plain-text command out on mount (keyframes in
 * styles.css) with a block caret; reduced motion shows it as is.
 */
export function Prompt({
  user,
  host,
  cwd,
  className,
  typed = false,
  children,
}: {
  user?: string;
  host?: string;
  cwd: string;
  className?: string;
  typed?: boolean;
  children?: ReactNode;
}) {
  const text = typed ? commandText(children) : null;
  return (
    <div className={`flex flex-wrap items-baseline gap-2.5 ${className ?? ''}`}>
      {user ? (
        <>
          <span className='text-chart-1'>{user}</span>
          <span className='text-muted-foreground/60'>@</span>
          <span className='text-chart-2'>{host}</span>{' '}
        </>
      ) : null}
      <span className='text-primary'>{cwd}</span>{' '}
      {text ? (
        // --chars / --type-ms drive term-type and term-caret (styles.css).
        <span
          className='flex min-w-0 max-w-full items-baseline text-foreground hover:text-primary'
          style={
            {
              '--chars': text.length,
              '--type-ms': `${Math.min(TYPE_MS_MAX, text.length * TYPE_MS_PER_CHAR)}ms`,
            } as CSSProperties
          }
        >
          {/* Holds the whole command in ch; the animation grows it from 0 one
              character per step. As a min-w-0 flex item it still shrinks to
              an ellipsis when the wrapper hits the row's max-w-full. */}
          <span className='min-w-0 overflow-hidden text-ellipsis whitespace-nowrap [max-width:calc(var(--chars)*1ch)] motion-safe:animate-term-type'>
            {text}
          </span>
          <span
            className='ml-0.5 inline-block h-[1.1em] w-[0.6em] shrink-0 translate-y-[0.15em] bg-primary opacity-0 motion-safe:animate-term-caret'
            aria-hidden='true'
          />
        </span>
      ) : children != null ? (
        <span className='text-foreground hover:text-primary'>{children}</span>
      ) : null}
    </div>
  );
}
