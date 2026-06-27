import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server';

const handler = createStartHandler(defaultStreamHandler);

// Canonical apex host, derived from APPS_WEB_URL at module load. A missing
// value (e.g. misconfigured env) just disables the redirect below rather than
// blocking every request.
const apexHost = hostFromUrl(process.env.APPS_WEB_URL);

function hostFromUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).host;
  } catch {
    return undefined;
  }
}

// Cloudflare Workers expects the default export to be an object with a `fetch`
// method (not the raw handler, which bundles as a class and trips workerd's
// "actor class as default entrypoint" check). Mirrors the shape of
// @tanstack/react-start/server-entry.
export default {
  async fetch(...args: Parameters<typeof handler>) {
    const request = args[0] as Request;
    // Canonicalize www -> apex with a 301 (e.g. www.perfectpan.org -> perfectpan.org),
    // preserving path and query. Runs before the app/auth handler.
    if (apexHost) {
      const url = new URL(request.url);
      if (url.host === `www.${apexHost}`) {
        url.host = apexHost;
        return Response.redirect(url.toString(), 301);
      }
    }
    return await handler(...args);
  },
};
