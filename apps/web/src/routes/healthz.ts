import { createFileRoute } from '@tanstack/react-router';

// Lightweight liveness probe for CI smoke checks + external monitoring.
// Deliberately has no DB / auth / env dependencies: it returns 200 as long as
// the Worker is running. Keep it cheap — do not add lookups here.
export const Route = createFileRoute('/healthz')({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify({ ok: true }), {
          headers: { 'content-type': 'application/json; charset=utf-8' },
        }),
    },
  },
  component: () => null,
});
