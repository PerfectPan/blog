import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { AppLayout } from '../components/layout.js';
import { SearchPalette } from '../components/search-palette.js';
import { SkinProvider } from '../skins/context.js';
import '../styles.css';

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
        content: '#000000',
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
      <AppLayout>
        <div className='mx-auto w-full self-start max-w-[80ch] pt-8'>
          <h2 className='mb-4 text-3xl'>Request Failed</h2>
          <p className='mb-4 opacity-70'>{String(error)}</p>
          <Link to='/blog' className='opacity-70 hover:opacity-100'>
            Back to blog
          </Link>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='mx-auto w-full self-start max-w-[80ch] pt-8'>
          <h2 className='mb-4 text-3xl'>404 Not Found</h2>
          <p className='mb-4 opacity-70'>你闯入了无人之境...</p>
          <Link to='/blog' className='opacity-70 hover:opacity-100'>
            Back to blog
          </Link>
        </div>
      </AppLayout>
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
      <SkinProvider initial='terminal'>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <SearchPalette />
      </SkinProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang='zh-CN' data-theme='terminal'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
