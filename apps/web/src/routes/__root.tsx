import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { AppLayout } from '../components/layout.js';
import { ErrorPage, NotFoundPage } from '../components/misc.js';
import { SearchPalette } from '../components/search-palette.js';
import '../styles.css';

/**
 * Runs before first paint (inline in <head>, after the meta it reads):
 * resolves the stored dark-mode preference — explicit light/dark, or the
 * system preference when unset — and applies the dark palette immediately so
 * a dark-mode visitor never sees the light theme flash first. DarkMode.tsx
 * re-asserts the same choice after hydration.
 */
const THEME_BOOT_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem('blog-theme')}catch(e){}var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#0a0f14');}}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: "PerfectPan's Blog",
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content: "PerfectPan's Blog",
      },
      {
        name: 'theme-color',
        content: '#ffffff',
      },
    ],
    links: [
      { rel: 'icon', href: '/images/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/icon-192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  // notFound/error render INSIDE RootComponent's tree — the root document
  // and app layout chrome are already there. Wrapping them again nests a
  // second <html>, which the parser drops and the 404/error content
  // silently disappears (the 404 body rendered empty because of this).
  errorComponent: ({ error }) => <ErrorPage error={error} />,
  notFoundComponent: () => <NotFoundPage />,
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      void import('react-grab');
    }
  }, []);

  useEffect(() => {
    // Register the service worker in production only (Bundle D / PWA).
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Best-effort; ignore registration failures.
      });
    }
  }, []);

  return (
    <RootDocument>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <SearchPalette />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN'>
      <head>
        <HeadContent />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, code-reviewed boot script (no user input). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
