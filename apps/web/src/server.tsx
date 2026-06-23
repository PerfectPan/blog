import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';

const handler = createStartHandler(defaultStreamHandler);

// Cloudflare Workers expects the default export to be an object with a `fetch`
// method (not the raw handler, which bundles as a class and trips workerd's
// "actor class as default entrypoint" check). Mirrors the shape of
// @tanstack/react-start/server-entry.
export default {
  async fetch(...args: Parameters<typeof handler>) {
    return await handler(...args);
  },
};
