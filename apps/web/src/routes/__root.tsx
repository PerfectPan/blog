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
        content: '#173E62',
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
        <div className='e-board'>
          <section className='e-sheet'>
            <span className='e-tick tl' aria-hidden='true' />
            <span className='e-tick tr' aria-hidden='true' />
            <span className='e-tick bl' aria-hidden='true' />
            <span className='e-tick br' aria-hidden='true' />
            <div className='e-nf'>
              <div className='lbl'>ERROR — REQUEST FAILED</div>
              <div className='code'>
                5<b>0</b>0
              </div>
              <p>{String(error)}</p>
              <Link to='/blog' className='e-btn'>
                ← BACK TO BLOG
              </Link>
            </div>
          </section>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='e-board'>
          <section className='e-sheet'>
            <span className='e-tick tl' aria-hidden='true' />
            <span className='e-tick tr' aria-hidden='true' />
            <span className='e-tick bl' aria-hidden='true' />
            <span className='e-tick br' aria-hidden='true' />
            <div className='e-nf'>
              <div className='lbl'>ERROR — NO SUCH DRAWING</div>
              <div className='code'>
                4<b>0</b>4
              </div>
              <p>本图集并无此图号 · 或已作废归档</p>
              <Link to='/blog' className='e-btn'>
                ← BACK TO BLOG
              </Link>
            </div>
            <div className='e-titleblock'>
              <span className='cell'>
                <b>PP-404</b>
              </span>
              <span className='cell'>
                TITLE<b>阙图</b>
              </span>
            </div>
          </section>
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
