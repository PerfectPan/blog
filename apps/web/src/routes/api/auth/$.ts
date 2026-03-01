import { createFileRoute } from '@tanstack/react-router';
import { auth, ensureAuthSchema } from '../../../lib/auth.js';

async function handleAuthRequest({ request }: { request: Request }) {
  await ensureAuthSchema();
  return auth.handler(request);
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      ANY: handleAuthRequest,
    },
  },
  component: () => null,
});
