/**
 * Isomorphic cookie parsing (no node APIs — safe in both SSR and client
 * bundles). Server-only cookie signing lives in `unlock-cookie.ts`.
 */
export function parseCookies(
  header: string | null | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) {
    return out;
  }
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = part.slice(0, eq).trim();
    if (key) {
      out[key] = decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return out;
}
