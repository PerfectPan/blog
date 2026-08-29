import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  readSkinFromCookie,
  SKIN_COOKIE,
  type Skin,
  THEME_COLOR,
} from '../lib/skin.js';

export { readSkinFromCookie, SKIN_COOKIE } from '../lib/skin.js';
export type { Skin };

const SkinContext = createContext<{
  skin: Skin;
  setSkin: (next: Skin) => void;
}>({ skin: 'terminal', setSkin: () => {} });

/**
 * The skin for the first client render, read from document.cookie. SSR always
 * renders the default (terminal) skin — see __root.tsx for why per-request
 * server-side reads are unreliable on this stack — and the boot script hides
 * the body for journal cookies until this provider applies the real skin.
 */
export function getInitialSkin(): Skin {
  if (import.meta.env.SSR) {
    return 'terminal';
  }
  return readSkinFromCookie(document.cookie);
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

  // Apply the cookie skin right after hydration (the boot script hid the
  // body for non-default skins so nothing flashes), then remove the hiding
  // style.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per page load; `initial` is a mount-time constant.
  useEffect(() => {
    const fromCookie = readSkinFromCookie(document.cookie);
    if (fromCookie !== initial) {
      setSkinState(fromCookie);
    }
    document.getElementById('skin-boot')?.remove();
  }, []);

  // Keep <html data-theme>, the dark class, and the theme-color meta in sync
  // with the current skin (covers both the mount correction and runtime
  // switches).
  useEffect(() => {
    document.documentElement.dataset.theme = skin;
    if (skin === 'journal') {
      // Journal is light-only; leave no stale dark class behind.
      document.documentElement.classList.remove('dark');
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[skin]);
  }, [skin]);

  const setSkin = useCallback((next: Skin) => {
    setSkinState(next);
    // DarkMode's local state can go stale across a skin switch (journal
    // forces the dark class off without telling it); let it re-sync.
    window.dispatchEvent(
      new CustomEvent('blog:skinchange', { detail: { skin: next } }),
    );
    // biome-ignore lint/suspicious/noDocumentCookie: skin preference is a non-sensitive UI cookie; document.cookie is the only dependency-free writer here.
    document.cookie = `${SKIN_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ skin, setSkin }), [skin, setSkin]);
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin() {
  return useContext(SkinContext);
}
