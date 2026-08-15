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
        content: '#FFFDF4',
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
        <div className='f-page'>
          <div className='f-nf'>
            <span
              className='f-sticker'
              style={{ background: '#FF6B35', color: '#fff' }}
            >
              REQUEST FAILED
            </span>
            <div className='code'>
              5<b>0</b>0
            </div>
            <p>{String(error)}</p>
            <Link to='/blog' className='f-btn f-btn-fill'>
              ← 回到博客
            </Link>
          </div>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='f-page'>
          <div className='f-nf'>
            <span
              className='f-sticker'
              style={{
                background: '#FF6B35',
                color: '#fff',
                transform: 'rotate(-2deg)',
              }}
            >
              PAGE NOT FOUND
            </span>
            <div className='code'>
              4<b>0</b>4
            </div>
            <p>你闯入了无人之境……</p>
            <Link to='/blog' className='f-btn f-btn-fill'>
              ← 回到博客
            </Link>
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
