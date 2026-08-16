import type { ReactNode } from 'react';
import { TerminalFooter } from '../skins/terminal/footer.js';
import { TerminalHeader } from '../skins/terminal/header.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell, skinnable (terminal / journal). The header sits OUTSIDE the
 * scroll container (`main`), so page overscroll only rubber-bands the content.
 * Window doesn't scroll; route scroll reset/restore for `main` is handled by
 * TanStack via `scrollToTopSelectors: ['main']` in router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='th-shell'>
      <TerminalHeader />
      <main className='th-main'>
        <div className='flex min-h-full flex-col'>
          <div className='flex-grow'>{children}</div>
          <TerminalFooter />
        </div>
      </main>
    </div>
  );
}
