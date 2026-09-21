import type { ReactNode } from 'react';

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

/**
 * The simulated-shell prompt line every page (and some sections) opens
 * with: user @ host cwd % command. Shared so its size and rhythm stay
 * identical everywhere — it inherits the body size, never sets one.
 * Omit `user` for continuation lines that start straight at the cwd.
 */
export function Prompt({
  user,
  host,
  cwd,
  className,
  children,
}: {
  user?: string;
  host?: string;
  cwd: string;
  className?: string;
  children?: ReactNode;
}) {
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
      {children != null ? (
        <span className='text-foreground hover:text-primary'>{children}</span>
      ) : null}
    </div>
  );
}
