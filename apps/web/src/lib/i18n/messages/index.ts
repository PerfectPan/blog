import { useLocale } from '../context.js';
import { type AuthMessages, authEn, authZh } from './auth.js';
import { type BlogMessages, blogEn, blogZh } from './blog.js';
import { type ChromeMessages, chromeEn, chromeZh } from './chrome.js';
import { type MiscMessages, miscEn, miscZh } from './misc.js';
import { type PagesMessages, pagesEn, pagesZh } from './pages.js';
import { type SocialMessages, socialEn, socialZh } from './social.js';

export * from './auth.js';
export * from './blog.js';
export * from './chrome.js';
export * from './misc.js';
export * from './pages.js';
export * from './social.js';

/**
 * Per-domain dictionary hooks: return the message bundle for the active
 * locale. Without a LocaleProvider (admin tree) useLocale falls back to zh.
 */

export function useChrome(): ChromeMessages {
  const { locale } = useLocale();
  return locale === 'en' ? chromeEn : chromeZh;
}

export function useBlog(): BlogMessages {
  const { locale } = useLocale();
  return locale === 'en' ? blogEn : blogZh;
}

export function useAuth(): AuthMessages {
  const { locale } = useLocale();
  return locale === 'en' ? authEn : authZh;
}

export function useSocial(): SocialMessages {
  const { locale } = useLocale();
  return locale === 'en' ? socialEn : socialZh;
}

export function usePages(): PagesMessages {
  const { locale } = useLocale();
  return locale === 'en' ? pagesEn : pagesZh;
}

export function useMisc(): MiscMessages {
  const { locale } = useLocale();
  return locale === 'en' ? miscEn : miscZh;
}
