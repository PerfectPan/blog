import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginPage } from '../components/auth.js';

export const Route = createFileRoute('/login')({
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-in/email',
          },
        }),
    },
  },
  // `error` is set by Better Auth when a GitHub sign-in fails.
  validateSearch: z.object({ error: z.string().optional() }),
  component: LoginRoute,
});

function LoginRoute() {
  const { error } = Route.useSearch();
  return <LoginPage searchError={error} />;
}
