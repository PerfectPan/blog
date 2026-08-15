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
        content: '#F7F8F5',
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
        <div className='z-page'>
          <div className='z-nf'>
            <div className='k'>虚</div>
            <p>{String(error)}</p>
            <p style={{ marginTop: 26 }}>
              <Link to='/blog' className='z-link'>
                回到目次
              </Link>
            </p>
          </div>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='z-page'>
          <div className='z-nf'>
            <div className='k'>空</div>
            <p>此处无文</p>
            <p style={{ marginTop: 26 }}>
              <Link to='/blog' className='z-link'>
                回到目次
              </Link>
            </p>
          </div>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  component: RootComponent,
});

function RootComponent() {
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
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
