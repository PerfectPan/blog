import type { ReactNode } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell (zen theme). The quiet header sits OUTSIDE the scroll container
 * (`main`). Window doesn't scroll; route scroll reset/restore for `main` is
 * handled by TanStack via `scrollToTopSelectors: ['main']` in router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='z-shell'>
      <Header />
      <main className='z-main'>
        <div className='flex min-h-full flex-col'>
          <div className='flex-grow'>{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
