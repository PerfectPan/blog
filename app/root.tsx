import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import { Footer } from './components/footer';
import { Header } from './components/header';
import stylesHref from './styles.css';

export const loader = async (_args: LoaderFunctionArgs) => {
  return {
    description: "PerfectPan's Blog",
    icon: '/images/favicon.png',
    title: "PerfectPan's Blog",
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.title ?? "PerfectPan's Blog";
  const description = data?.description ?? "PerfectPan's Blog";
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesHref },
  { rel: 'icon', type: 'image/png', href: '/images/favicon.png' },
];

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body className='dark:bg-wash-dark dark:text-white'>
        <div id='__waku'>
          <Header />
          <div className='flex flex-col min-h-screen px-6'>
            <main className='flex flex-grow items-center justify-center *:min-h-64 *:min-w-64'>
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return (
    <div className='flex flex-col items-center justify-center text-2xl'>
      Something went wrong.
    </div>
  );
}
