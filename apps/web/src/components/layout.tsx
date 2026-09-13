import type { ReactNode } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';
import { Particles } from './particles.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell, over one fixed ambient-particles canvas. The header sits OUTSIDE
 * the scroll container (`main`), so page overscroll only rubber-bands the
 * content. Window doesn't scroll; route scroll reset/restore for `main` is
 * handled by TanStack via `scrollToTopSelectors: ['main']` in router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Particles />
      <div className='th-shell'>
        <Header />
        <main className='th-main'>
          <div className='flex min-h-full flex-col'>
            <div className='flex-grow'>{children}</div>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}
