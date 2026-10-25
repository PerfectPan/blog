import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import type { SessionUser } from '@blog/shared';
import { getSessionUserServerFn } from '../lib/session-service.js';
import { SESSION_CHANGED_KEY } from '../lib/session-user.js';

export function SessionRevalidation({ sessionUser }: { sessionUser: SessionUser | null }) {
  const router = useRouter();
  const identity = JSON.stringify(sessionUser);

  useEffect(() => {
    let cancelled = false;
    let checking = false;
    let refreshQueued = false;
    let lastChecked = Date.now();
    const check = async (force = false) => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) {
        return;
      }
      if (checking) {
        refreshQueued ||= force;
        return;
      }
      if (!force && Date.now() - lastChecked < 5000) {
        return;
      }
      lastChecked = Date.now();
      checking = true;
      try {
        const next = await getSessionUserServerFn();
        if (!cancelled && JSON.stringify(next) !== identity) {
          router.clearCache();
          await router.invalidate();
        }
      } catch (error) {
        console.error('[web] session revalidation failed', error);
      } finally {
        checking = false;
        if (refreshQueued && !cancelled) {
          refreshQueued = false;
          void check(true);
        }
      }
    };
    const onFocus = () => void check();
    const onOnline = () => void check(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_CHANGED_KEY) {
        void check(true);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('storage', onStorage);
    };
  }, [identity, router]);

  return null;
}
