import { DEFAULT_LOCALE, isLocale, type Locale } from '@blog/shared';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { setLocaleServerFn } from '../locale-service.js';
import { formatMsg, type IcuMsg, type Msg } from './messages.js';

/**
 * Client-side locale state for the UI i18n (zh default, en optional).
 *
 * The locale is a preference, not a URL dimension: SSR always renders zh (so
 * the edge cache for /blog/<slug> stays locale-agnostic), and the client
 * adopts the real preference after mount — signed-in users get theirs from
 * the root loader (user.locale), guests from localStorage, which is allowed
 * to flash zh before switching.
 */

/** Guest preference key; signed-in users persist via setLocaleServerFn. */
export const LOCALE_STORAGE_KEY = 'blog-locale';

/** BCP-47 tag for <html lang> per UI locale. */
const LANG_TAGS: Record<Locale, string> = { zh: 'zh-CN', en: 'en' };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Trees rendered without the provider (admin stays untranslated) fall back
// to zh; switching there is a silent no-op so nothing crashes.
const FALLBACK: LocaleContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
};

function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    // Private mode and hardened browsers can throw on access; the preference
    // is then simply not restored.
    return null;
  }
}

type LocaleProviderProps = {
  children: ReactNode;
  /** Server-resolved preference (root loader: user.locale, else zh). */
  initialLocale?: Locale;
  /** Whether the root loader saw a signed-in session. */
  isLoggedIn?: boolean;
};

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  isLoggedIn = false,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  // Server value the state was last synced from. Guards against a stale
  // cached loader prop (from before a local switch) clobbering the UI.
  const appliedInitialRef = useRef(initialLocale);
  const wasLoggedInRef = useRef(isLoggedIn);
  const mountedRef = useRef(false);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    // Always remember on the device; persistence failures are silent by
    // design (private mode blocks writes, the UI keeps working).
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore.
    }
    document.documentElement.lang = LANG_TAGS[next];
    // Signed-in users get the preference synced to their account (best
    // effort; the local state is already correct).
    if (wasLoggedInRef.current) {
      setLocaleServerFn({ data: { locale: next } }).catch((error) => {
        console.error('[web] persist user locale failed', error);
      });
    }
  };

  useEffect(() => {
    // All of this runs after mount only — SSR never touches localStorage and
    // renders zh, so hydration stays deterministic.
    const firstRun = !mountedRef.current;
    mountedRef.current = true;
    const loginStateChanged = wasLoggedInRef.current !== isLoggedIn;
    wasLoggedInRef.current = isLoggedIn;

    if (isLoggedIn) {
      if (firstRun) {
        // State already initialized from the account preference.
        return;
      }
      // Adopt a freshly delivered account preference (first login while
      // mounted, or a root-loader refetch after an identity change). A
      // locally switched locale survives because the stale cached prop
      // equals appliedInitialRef and is ignored.
      if (loginStateChanged || initialLocale !== appliedInitialRef.current) {
        appliedInitialRef.current = initialLocale;
        setLocaleState(initialLocale);
      }
      return;
    }

    // Guest: the device preference wins over the default. Read on mount and
    // again on a signed-out transition.
    if (!firstRun && !loginStateChanged) {
      return;
    }
    appliedInitialRef.current = initialLocale;
    setLocaleState(readStoredLocale() ?? initialLocale);
  }, [initialLocale, isLoggedIn]);

  // Keep <html lang> in step with the rendered locale (SSR emits zh-CN).
  useEffect(() => {
    document.documentElement.lang = LANG_TAGS[locale];
  }, [locale]);

  const value = { locale, setLocale };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext) ?? FALLBACK;
}

/** `t(entry)` resolves a message entry in the active locale; ICU entries take
 *  a named-args object: `t(POSTS_COUNT, { count: 5 })`. */
export type TFn = {
  (entry: Msg & { __args?: never }): string;
  <A extends Record<string, string | number>>(
    entry: IcuMsg<A>,
    args: A,
  ): string;
};

export function useT(): TFn {
  const { locale } = useLocale();
  return ((entry: Msg, args?: Record<string, string | number>): string =>
    formatMsg(locale, entry, args)) as TFn;
}
