import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { AppLayout } from '../components/layout.js';
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
        content: "PerfectPan's Blog with role-based access",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <RootDocument>
      <AppLayout>
        <div className='card'>
          <h2>Request Failed</h2>
          <p className='meta'>{String(error)}</p>
          <Link to='/blog'>Back to blog</Link>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  notFoundComponent: () => (
    <RootDocument>
      <AppLayout>
        <div className='card'>
          <h2>404 Not Found</h2>
          <p className='meta'>你闯入了无人之境...</p>
          <Link to='/blog'>Back to blog</Link>
        </div>
      </AppLayout>
    </RootDocument>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppLayout>
        <Outlet />
      </AppLayout>
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
