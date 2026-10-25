import { createFileRoute, getRouteApi } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginPage } from '../components/auth/auth';

const routeApi = getRouteApi('/login');

function LoginRoute() {
  const { error } = routeApi.useSearch();
  return <LoginPage searchError={error} />;
}

export const Route = createFileRoute('/login')({
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-in/email'
          }
        })
    }
  },
  // `error` is set by Better Auth when a GitHub sign-in fails.
  validateSearch: z.object({ error: z.string().optional() }),
  component: LoginRoute
});
