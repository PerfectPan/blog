import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { AppLayout } from '../components/layout.js';
import { SearchPalette } from '../components/search-palette.js';
import { SkinProvider, useSkin } from '../skins/context.js';
import { JournalError, JournalNotFound } from '../skins/journal/misc.js';
import { TerminalError, TerminalNotFound } from '../skins/terminal/misc.js';
import '../styles.css';

/**
 * Runs before first paint: if the cookie picks the journal skin, hide the
 * body so the terminal-themed SSR HTML never flashes; React applies the
 * journal skin right after hydration and SkinProvider removes this style.
 */
const SKIN_BOOT_SCRIPT = `(function(){try{if(/(?:^|;\\s*)blog-skin=journal(?:;|$)/.test(document.cookie)){var s=document.createElement('style');s.id='skin-boot';s.textContent='body{visibility:hidden}';document.head.appendChild(s);}}catch(e){}})();`;

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
        content: '#F4F2EC',
      },
    ],
    links: [
      { rel: 'icon', href: '/images/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/icon-192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' },
    ],
  }),
  errorComponent: ({ error }) => (
    <RootDocument>
      <SkinPage>
        <AppLayout>
          <SkinError error={error} />
        </AppLayout>
      </SkinPage>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <SkinPage>
        <AppLayout>
          <SkinNotFound />
        </AppLayout>
      </SkinPage>
    </RootDocument>
  ),
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
      <SkinPage>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <SearchPalette />
      </SkinPage>
    </RootDocument>
  );
}

/**
 * SSR always renders the default (terminal) skin — the framework's
 * per-request context proved unreliable on workerd — and the provider applies
 * the cookie skin immediately after hydration (see context.tsx), so the boot
 * script above is the only thing a journal user ever sees pre-skin.
 */
function SkinPage({ children }: { children: ReactNode }) {
  return <SkinProvider initial='terminal'>{children}</SkinProvider>;
}

function SkinNotFound() {
  const { skin } = useSkin();
  return skin === 'journal' ? <JournalNotFound /> : <TerminalNotFound />;
}

function SkinError({ error }: { error: unknown }) {
  const { skin } = useSkin();
  return skin === 'journal' ? (
    <JournalError error={error} />
  ) : (
    <TerminalError error={error} />
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN' data-theme='terminal'>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, code-reviewed boot script (no user input). */}
        <script dangerouslySetInnerHTML={{ __html: SKIN_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
