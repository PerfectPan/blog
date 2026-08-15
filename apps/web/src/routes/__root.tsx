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
        content: '#F6F3EC',
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
        <div className='j-sheet'>
          <h1 className='j-entry-title text-center'>未能成页</h1>
          <p className='j-entry-meta text-center'>{String(error)}</p>
          <p className='j-backlink'>
            <Link to='/blog'>— 返 目 次 —</Link>
          </p>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='j-nf'>
          <span className='j-seal' aria-hidden='true'>
            阙
          </span>
          <div className='zh' style={{ marginTop: 30 }}>
            此页未收
          </div>
          <p>本刊并无此篇 · 或已散佚</p>
          <p style={{ marginTop: 26 }}>
            <Link to='/blog' className='j-btn'>
              返 目 次
            </Link>
          </p>
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
