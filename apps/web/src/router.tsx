import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  // SSR requests must not share mutable route state or pending loads.
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // App scroll lives on <main>, not window — without this, TanStack carries
    // the previous route's main.scrollTop into the next page on PUSH.
    scrollToTopSelectors: ['main'],
    defaultPreload: 'intent',
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
