type AttemptRecord = {
  count: number;
  windowStartAt: number;
};

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const store = new Map<string, AttemptRecord>();

function normalizeIp(ip: string | null): string {
  return (ip ?? 'unknown').trim() || 'unknown';
}

export function isUnlockRateLimited(slug: string, ip: string | null): boolean {
  const key = `${slug}:${normalizeIp(ip)}`;
  const now = Date.now();
  const current = store.get(key);
  if (!current) {
    return false;
  }

  if (now - current.windowStartAt > WINDOW_MS) {
    store.delete(key);
    return false;
  }

  return current.count >= MAX_ATTEMPTS;
}

export function recordUnlockFailure(slug: string, ip: string | null): void {
  const key = `${slug}:${normalizeIp(ip)}`;
  const now = Date.now();
  const current = store.get(key);

  if (!current || now - current.windowStartAt > WINDOW_MS) {
    store.set(key, {
      count: 1,
      windowStartAt: now,
    });
    return;
  }

  store.set(key, {
    count: current.count + 1,
    windowStartAt: current.windowStartAt,
  });
}

export function clearUnlockFailures(slug: string, ip: string | null): void {
  store.delete(`${slug}:${normalizeIp(ip)}`);
}
