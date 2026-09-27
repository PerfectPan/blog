import { DEFAULT_LOCALE, type Locale } from '@blog/shared';

/** BCP-47 tag per UI locale, aligned with the rendered interface language. */
const DATE_LOCALES: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en-US',
};

/**
 * Long-form date for an ISO timestamp — same Intl options as the existing
 * article.tsx rendering ("March 8, 2026" for en; zh-CN renders "2026年3月8日").
 * Route head metadata stays untranslated; this is only for visible dates.
 */
export function formatDate(
  iso: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALES[locale], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
