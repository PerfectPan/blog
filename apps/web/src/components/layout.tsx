import type { ReactNode } from 'react';
import { useSkin } from '../skins/context.js';
import { JournalFooter } from '../skins/journal/footer.js';
import { JournalHeader } from '../skins/journal/header.js';
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
  const { skin } = useSkin();

  if (skin === 'journal') {
    return (
      <div className='j-shell'>
        <JournalHeader />
        <main className='j-main'>
          <div className='flex min-h-full flex-col'>
            <div className='flex-grow'>{children}</div>
            <JournalFooter />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='flex h-dvh flex-col'>
      <TerminalHeader />
      <main className='flex-1 overflow-y-auto bg-term'>
        <div className='flex min-h-full flex-col'>
          <div className='flex-grow'>{children}</div>
          <TerminalFooter />
        </div>
      </main>
    </div>
  );
}
