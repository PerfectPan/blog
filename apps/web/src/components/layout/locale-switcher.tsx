import type { Locale } from '@blog/shared';
import { Languages } from 'lucide-react';
import { useLocale, useT } from '../../lib/i18n/context.js';
import { LANG_EN_NAME, LANG_ZH_NAME, SWITCH_LOCALE } from '../../lib/i18n/messages.js';
import { SHEET_ROW, TOOL_BTN, TOOL_VIS } from './term';

export function LocaleSwitcher({ variant }: { variant: 'bar' | 'sheet' }) {
  const { locale, setLocale } = useLocale();
  const t = useT();
  const next: Locale = locale === 'zh' ? 'en' : 'zh';
  const label = next === 'zh' ? t(LANG_ZH_NAME) : t(LANG_EN_NAME);
  const ariaLabel = t(SWITCH_LOCALE, { name: label });

  if (variant === 'sheet') {
    return (
      <button type='button' aria-label={ariaLabel} onClick={() => setLocale(next)} className={SHEET_ROW}>
        <Languages size={14} aria-hidden='true' /> {label}
      </button>
    );
  }

  return (
    <button type='button' aria-label={ariaLabel} onClick={() => setLocale(next)} className={`${TOOL_BTN} ${TOOL_VIS}`}>
      <Languages size={15} aria-hidden='true' />
      <span className='hidden md:inline'>{label}</span>
    </button>
  );
}
