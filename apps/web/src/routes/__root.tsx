import { DEFAULT_LOCALE } from '@blog/shared';
import { createRootRoute, getRouteApi, Outlet } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AppLayout } from '../components/layout.js';
import { ErrorPage } from '../components/error-page.js';
import { NotFoundPage } from '../components/misc.js';
import { RootDocument } from './root-document.js';
import { SessionRevalidation } from './session-revalidation.js';
import { SearchPalette } from '../components/search-palette.js';
import { LocaleProvider } from '../lib/i18n/context.js';
import { getSessionUserServerFn } from '../lib/session-service.js';
import '../styles.css';

/**
 * Runs before first paint (inline in <head>, after the meta it reads):
 * resolves the stored dark-mode preference — explicit light/dark, or the
 * system preference when unset — and applies the dark palette immediately so
 * a dark-mode visitor never sees the light theme flash first. DarkMode.tsx
 * re-asserts the same choice after hydration.
 */

function RootComponent() {
  const routeApi = getRouteApi('__root__');
  const { sessionUser } = routeApi.useLoaderData();

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
      <SessionRevalidation sessionUser={sessionUser} />
      <LocaleProvider initialLocale={sessionUser?.locale ?? DEFAULT_LOCALE} isLoggedIn={sessionUser != null}>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <SearchPalette />
      </LocaleProvider>
    </RootDocument>
  );
}

export const Route = createRootRoute({
  // Hydrate only the UI user fields, never the session token. Guest locale
  // stays client-local so public article HTML remains safe to edge-cache.
  loader: async () => {
    return { sessionUser: await getSessionUserServerFn() };
  },
  head: () => ({
    meta: [
      {
        title: "PerfectPan's Blog"
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        name: 'description',
        content: "PerfectPan's Blog"
      },
      {
        name: 'theme-color',
        content: '#ffffff'
      }
    ],
    links: [
      { rel: 'icon', href: '/images/favicon.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/icon-192.png' },
      { rel: 'manifest', href: '/manifest.webmanifest' }
    ]
  }),
  // notFound/error render INSIDE RootComponent's tree — the root document
  // and app layout chrome are already there. Wrapping them again nests a
  // second <html>, which the parser drops and the 404/error content
  // silently disappears (the 404 body rendered empty because of this).
  errorComponent: ({ error }) => <ErrorPage error={error} />,
  notFoundComponent: () => <NotFoundPage />,
  component: RootComponent
});
