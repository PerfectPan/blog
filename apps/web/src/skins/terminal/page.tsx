import type { ReactNode } from 'react';

/**
 * The single content container for every terminal-skin page. Owns the page
 * width decision (max-w) and the responsive gutters — pages never set their
 * own width. `className` lets a page add a typography scope (e.g. `th-auth`)
 * without wrapping in another container.
 */
export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `th-page ${className}` : 'th-page'}>
      {children}
    </div>
  );
}
