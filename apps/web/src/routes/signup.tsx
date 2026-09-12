import { createFileRoute } from '@tanstack/react-router';
import { TerminalSignupPage } from '../skins/terminal/auth.js';

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
  component: SignUpPage,
});

function SignUpPage() {
  return <TerminalSignupPage />;
}
