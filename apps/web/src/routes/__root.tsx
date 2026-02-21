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
        content: "PerfectPan's Blog",
      },
    ],
    links: [{ rel: 'icon', href: '/images/favicon.png', type: 'image/png' }],
  }),
  errorComponent: ({ error }) => (
    <RootDocument>
      <AppLayout>
        <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
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
        <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
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
