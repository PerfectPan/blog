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
        content: '#0A0F14',
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
        <div className='th-page'>
          <div className='th-prompt'>
            <span className='th-prompt-u'>guest</span>
            <span className='th-prompt-at'>@</span>
            <span className='th-prompt-h'>perfectpan.org</span>{' '}
            <span className='th-prompt-p'>~ %</span>{' '}
            <span className='th-cmd'>curl -I $(hostname)</span>
          </div>
          <p className='th-out th-nf-big'>Request failed: {String(error)}</p>
          <Link to='/blog' className='th-cd'>
            cd ~/blog
          </Link>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='th-page'>
          <div className='th-prompt'>
            <span className='th-prompt-u'>guest</span>
            <span className='th-prompt-at'>@</span>
            <span className='th-prompt-h'>perfectpan.org</span>{' '}
            <span className='th-prompt-p'>~ %</span>{' '}
            <span className='th-cmd'>cd /nowhere</span>
          </div>
          <p className='th-out th-nf-big'>
            bash: cd: /nowhere: No such file or directory
          </p>
          <p className='th-out th-comment'># 你闯入了无人之境。</p>
          <p className='th-out mt-4'>
            <Link to='/blog' className='th-cd'>
              cd ~/blog
            </Link>
            <span className='th-comment'> ← 回到博客列表</span>
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
    // Terminal theme is dark-native: render with .dark so existing dark:
    // variants and shiki dual-themes apply without a client-side flash.
    <html lang='zh-CN' className='dark'>
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
