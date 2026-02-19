import { createAPIFileRoute } from '@tanstack/react-start/api';
import { auth } from '../../../lib/auth.js';

async function handleAuthRequest({ request }: { request: Request }) {
  return auth.handler(request);
}

export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: handleAuthRequest,
  POST: handleAuthRequest,
  OPTIONS: handleAuthRequest,
});
