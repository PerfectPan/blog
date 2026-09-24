import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Footer } from './footer.js';
import { Header } from './header.js';
import { TraceBackground } from './trace-background.js';

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * App shell. The header and the tmux status bar (footer) both sit OUTSIDE
 * the scroll container (`main`), so overscroll bounce only rubber-bands the
 * content between them; a bar inside `main` would bounce along and expose
 * bare background beyond it. Window doesn't scroll; route scroll
 * reset/restore for `main` is handled by TanStack via
 * `scrollToTopSelectors: ['main']` in router.tsx.
 */
export function AppLayout({ children }: AppLayoutProps) {
  // Observable hydration marker: e2e waits on html[data-hydrated] so clicks
  // never race React before handlers are attached (same idea as the editor's
  // useHydrated gate).
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  return (
    <div className='relative z-[1] flex h-dvh flex-col'>
      <TraceBackground />
      <Header />
      {/* Stable gutter: classic (non-overlay) scrollbars would otherwise
          shift the centered column between short and long pages, which
          jumps the content and makes the backdrop regrow its traces.
          overscroll-y-contain keeps main's own bounce but stops the scroll
          chaining up to the root (see html in styles.css). */}
      <main className='min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-transparent [scrollbar-gutter:stable]'>
        {children}
      </main>
      <Footer />
    </div>
  );
}
