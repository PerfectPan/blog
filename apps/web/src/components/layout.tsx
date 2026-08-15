import type { ReactNode } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell (blueprint theme). The drawing-index bar sits OUTSIDE the scroll
 * container (`main`). Window doesn't scroll; route scroll reset/restore for
 * `main` is handled by TanStack via `scrollToTopSelectors: ['main']` in
 * router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='e-shell'>
      <Header />
      <main className='e-main'>
        <div className='flex min-h-full flex-col'>
          <div className='flex-grow'>{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
