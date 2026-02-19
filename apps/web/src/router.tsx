import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root.js';
import { Route as BlogPostRoute } from './routes/blog/$slug.js';
import { Route as BlogIndexRoute } from './routes/blog/index.js';
import { Route as HomeRoute } from './routes/index.js';
import { Route as LoginRoute } from './routes/login.js';
import { Route as LogoutRoute } from './routes/logout.js';
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
]);

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
