import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

let routerInstance: ReturnType<typeof createRouter> | null = null;

export function getRouter() {
  if (!routerInstance) {
    routerInstance = createRouter({
      routeTree,
      scrollRestoration: true,
      defaultPreload: 'intent',
    });
  }

  return routerInstance;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
