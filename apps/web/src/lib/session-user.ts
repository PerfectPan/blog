import { useLoaderData, useRouter } from '@tanstack/react-router';

export const SESSION_CHANGED_KEY = 'blog-session-changed';

export function useSessionUser() {
  return useLoaderData({
    from: '__root__',
    select: (data) => data.sessionUser,
    structuralSharing: true,
  });
}

/** Call after a successful auth mutation, once the browser has its new cookie. */
export function useRefreshSession() {
  const router = useRouter();
  return async () => {
    router.clearCache();
    await router.invalidate();
    try {
      // Other tabs revalidate against the server; no identity is stored here.
      localStorage.setItem(SESSION_CHANGED_KEY, crypto.randomUUID());
    } catch {
      // Focus/online revalidation still works when storage is unavailable.
    }
  };
}
