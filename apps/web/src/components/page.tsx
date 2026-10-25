import type { ReactNode } from 'react';

/**
 * The single content container for every terminal-skin page. Owns the page
 * width decision (max-w) and the responsive gutters — pages never set their
 * own width. `className` lets a page add a typography scope without wrapping
 * in another container. The 640–1100px band widens the gutter so the column
 * reads as centered before the 880px max-width binds.
 */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
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

/** The command as plain text, or null when children hold elements. */

/**
 * The simulated-shell prompt line every page (and some sections) opens
 * with: user @ host cwd % command. Shared so its size and rhythm stay
 * identical everywhere — it inherits the body size, never sets one.
 * Omit `user` for continuation lines that start straight at the cwd.
 * `typed` types a plain-text command out on mount (keyframes in
 * styles.css) with a block caret; reduced motion shows it as is.
 */
