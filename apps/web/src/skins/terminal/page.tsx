import type { ReactNode } from 'react';

/**
 * The single content container for every terminal-skin page. Owns the page
 * width decision (max-w) and the responsive gutters — pages never set their
 * own width.
 */
export function Page({ children }: { children: ReactNode }) {
  return <div className='th-page'>{children}</div>;
}
