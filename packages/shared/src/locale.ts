/** UI (interface) languages. Not a URL dimension — a per-user preference. */
export const LOCALES = ['zh', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** Fallback everywhere: unset/unknown preferences mean zh. */
export const DEFAULT_LOCALE: Locale = 'zh';

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
  );
}
