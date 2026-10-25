import { Link } from '@tanstack/react-router';
import { useT } from '../../lib/i18n/context.js';
import {
  BACK_TO_POST,
  SUDO_UNLOCK,
  UNLOCK_ERROR_INVALID,
  UNLOCK_ERROR_MISSING,
  UNLOCK_HINT,
  UNLOCK_PASSWORD_LABEL
} from '../../lib/i18n/messages.js';
import { Page } from '../layout/page';
import { Prompt } from '../layout/prompt';

export function UnlockPage({ slug, search }: { slug: string; search?: Record<string, string | undefined> }) {
  const t = useT();
  const { error: searchError } = (search ?? {}) as { error?: string };
  const errorLabel =
    searchError === 'missing'
      ? t(UNLOCK_ERROR_MISSING)
      : searchError === 'invalid'
        ? t(UNLOCK_ERROR_INVALID)
        : undefined;

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        cat posts/{slug}.md
      </Prompt>
      <p className='mb-1'>
        <span className='text-destructive'>cat: posts/{slug}.md: Permission denied</span>
      </p>
      <p className='mb-1 text-xs text-muted-foreground/60'>{t(UNLOCK_HINT)}</p>
      <form method='post' className='mt-4'>
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='password'>
            <span className='text-primary'>▸ </span>
            {t(UNLOCK_PASSWORD_LABEL)}
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='w-full rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
          />
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          <button
            type='submit'
            className='cursor-pointer rounded-lg border border-primary bg-primary px-3.5 py-1.75 text-sm text-primary-foreground transition duration-100 hover:brightness-95'
          >
            {t(SUDO_UNLOCK)}
          </button>
          <Link to='/blog/$slug' params={{ slug }} className='text-muted-foreground hover:text-foreground'>
            {t(BACK_TO_POST)}
          </Link>
        </div>
        {errorLabel ? (
          <p role='alert' className='my-2.5 text-sm text-destructive'>
            {errorLabel}
          </p>
        ) : null}
      </form>
    </Page>
  );
}
