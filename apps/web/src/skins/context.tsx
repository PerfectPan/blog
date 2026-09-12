import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Skin = 'terminal' | 'journal';

const SkinContext = createContext<{
  skin: Skin;
  setSkin: (next: Skin) => void;
}>({ skin: 'terminal', setSkin: () => {} });

export const SKIN_COOKIE = 'blog-skin';

export function readSkinFromCookie(cookie: string | null): Skin {
  return /(?:^|;\s*)blog-skin=journal(?:;|$)/.test(cookie ?? '')
    ? 'journal'
    : 'terminal';
}

/**
 * Runtime skin switcher for the two UX themes (terminal / journal). SSR and
 * the first client render always start on `terminal` (workerd's request
 * context is sticky across requests, so the cookie cannot be trusted
 * server-side); a pre-paint boot script in __root hides the body for journal
 * cookies, and this provider applies the cookie skin after hydration and
 * removes the hiding style. Switching updates <html data-theme>, persists
 * the cookie, and drops `dark` when entering the light-only journal skin.
 */
export function SkinProvider({
  initial,
  children,
}: {
  initial: Skin;
  children: ReactNode;
}) {
  const [skin, setSkinState] = useState<Skin>(initial);

  // SSR renders the default skin (per-request context is unreliable on
  // workerd); apply the cookie skin right after hydration. __root's boot
  // script hid the body for non-default skins so nothing flashes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per page load; `initial` is a mount-time constant.
  useEffect(() => {
    const fromCookie = readSkinFromCookie(document.cookie);
    if (fromCookie !== initial) {
      setSkin(fromCookie);
    }
    document.getElementById('skin-boot')?.remove();
  }, []);

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    document.documentElement.dataset.theme = next;
    if (next === 'journal') {
      // Journal is light-only; leave no stale dark class behind.
      document.documentElement.classList.remove('dark');
    }
    // biome-ignore lint/suspicious/noDocumentCookie: skin preference is a non-sensitive UI cookie; document.cookie is the only dependency-free writer here.
    document.cookie = `${SKIN_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ skin, setSkin }), [skin, setSkin]);
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  return useContext(SkinContext);
}
