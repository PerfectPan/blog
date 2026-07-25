import { useRouterState } from '@tanstack/react-router';
import { type ReactNode, useEffect, useRef } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell. The header sits OUTSIDE the scroll container (`main`), so page
 * overscroll only rubber-bands the content — the pinned header never moves
 * (no macOS "fixed header drags on overscroll"). The window itself doesn't
 * scroll, so we reset the `main` scroll position on route change ourselves
 * (the browser / TanStack window-scroll-restoration targets the window).
 */
export function AppLayout({ children }: AppLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on route change, pathname unused in body on purpose
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className='flex h-dvh flex-col'>
      <Header />
      <main ref={mainRef} className='flex-1 overflow-y-auto'>
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
