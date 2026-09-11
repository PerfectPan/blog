import { createFileRoute } from '@tanstack/react-router';
import { useSkin } from '../skins/context.js';
import { JournalLoginPage } from '../skins/journal/auth.js';
import { TerminalLoginPage } from '../skins/terminal/auth.js';

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
  component: LoginPage,
});

function LoginPage() {
  const { skin } = useSkin();
  return skin === 'journal' ? <JournalLoginPage /> : <TerminalLoginPage />;
}
