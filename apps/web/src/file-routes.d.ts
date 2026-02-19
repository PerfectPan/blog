import '@tanstack/react-router';
import type { AnyRoute } from '@tanstack/react-router';

type FileRouteShape = {
  id: string;
  path: string;
  fullPath: string;
  preLoaderRoute: AnyRoute;
  parentRoute: AnyRoute;
};

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': FileRouteShape;
    '/api/auth/$': FileRouteShape;
    '/blog/': FileRouteShape;
    '/blog/$slug': FileRouteShape;
    '/login': FileRouteShape;
    '/logout': FileRouteShape;
    '/rss.xml': FileRouteShape;
    '/signup': FileRouteShape;
    '/unlock/$slug': FileRouteShape;
  }
}
