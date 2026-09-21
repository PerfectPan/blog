import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginPage } from '../components/auth.js';
import { getAuthProvidersServerFn } from '../lib/auth-service.js';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    // Better Auth appends ?error=<code> to the callback redirect when an
    // OAuth flow fails on the provider side.
    error: z.string().optional(),
  }),
  loader: async () => getAuthProvidersServerFn(),
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
  component: LoginPageView,
});

function LoginPageView() {
  const { github } = Route.useLoaderData();
  const { error } = Route.useSearch();
  return <LoginPage githubEnabled={github} oauthError={error} />;
}
