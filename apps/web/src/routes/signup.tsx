import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SignupPage } from '../components/auth.js';

export const Route = createFileRoute('/signup')({
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
  // `error` is set by Better Auth when a GitHub sign-up fails.
  validateSearch: z.object({ error: z.string().optional() }),
  component: SignUpPage,
});

function SignUpPage() {
  const { error } = Route.useSearch();
  return <SignupPage searchError={error} />;
}
