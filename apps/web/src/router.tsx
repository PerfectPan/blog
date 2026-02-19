import { createRouter } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root.js';
import { Route as AuthApiRoute } from './routes/api/auth/$.js';
import { Route as BlogPostRoute } from './routes/blog/$slug.js';
import { Route as BlogIndexRoute } from './routes/blog/index.js';
import { Route as HomeRoute } from './routes/index.js';
import { Route as LoginRoute } from './routes/login.js';
import { Route as LogoutRoute } from './routes/logout.js';
import { Route as RssRoute } from './routes/rss[.]xml.js';
import { Route as SignUpRoute } from './routes/signup.js';
import { Route as UnlockRoute } from './routes/unlock/$slug.js';

const routeTree = RootRoute.addChildren([
  HomeRoute,
  BlogIndexRoute,
  BlogPostRoute,
  LoginRoute,
  SignUpRoute,
  LogoutRoute,
  UnlockRoute,
  RssRoute,
  AuthApiRoute,
]);

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
