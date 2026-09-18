import type { ReactNode } from 'react';
import { useEffect } from 'react';
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
 * The shell sits above the particles canvas (z-0, pointer-events-none) and
 * stays transparent so the constellation shows through the content area.
 */
export function AppLayout({ children }: AppLayoutProps) {
  // Observable hydration marker: e2e waits on html[data-hydrated] so clicks
  // never race React before handlers are attached (same idea as the editor's
  // useHydrated gate).
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  return (
    <>
      <Particles />
      <div className='relative z-1 flex h-dvh flex-col'>
        <Header />
        <main className='min-h-0 flex-1 overflow-y-auto bg-transparent'>
          <div className='flex min-h-full flex-col'>
            <div className='flex-grow'>{children}</div>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
}
