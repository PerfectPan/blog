import type { ReactNode } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell. The header sits OUTSIDE the scroll container (`main`), so page
 * overscroll only rubber-bands the content — the pinned header never moves
 * (no macOS "fixed header drags on overscroll"). Window doesn't scroll; route
 * scroll reset/restore for `main` is handled by TanStack via
 * `scrollToTopSelectors: ['main']` in router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='flex h-dvh flex-col'>
      <Header />
      <main className='flex-1 overflow-y-auto'>
        <div className='flex min-h-full flex-col'>
          <div className='flex flex-grow items-center justify-center px-6 *:min-h-64 *:min-w-64'>
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
