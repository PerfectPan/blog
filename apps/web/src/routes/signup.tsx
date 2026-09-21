import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SignupPage } from '../components/auth.js';
import { getAuthProvidersServerFn } from '../lib/auth-service.js';

export const Route = createFileRoute('/signup')({
  validateSearch: z.object({
    error: z.string().optional(),
  }),
  loader: async () => getAuthProvidersServerFn(),
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-up/email',
          },
        }),
    },
  },
  component: SignUpPageView,
});

function SignUpPageView() {
  const { github } = Route.useLoaderData();
  const { error } = Route.useSearch();
  return <SignupPage githubEnabled={github} oauthError={error} />;
}
