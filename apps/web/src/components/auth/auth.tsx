import { Link, useHydrated, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../../lib/auth-client.js';
import { useLocale, useT } from '../../lib/i18n/context.js';
import {
  authErrorMessage,
  CHECKING_SESSION,
  CONTINUE_WITH_GITHUB,
  EMAIL_LABEL,
  GITHUB_SIGN_IN_FAILED,
  LOGIN_HINT,
  NO_ACCOUNT_YET,
  PASSWORD_LABEL,
  SIGN_IN,
  SIGN_IN_FAILED,
  SIGNING_IN,
  SIGNUP_LINK
} from '../../lib/i18n/messages.js';
import { useRefreshSession, useSessionUser } from '../../lib/session-user.js';
import { Page } from '../layout/page';
import { Prompt } from '../layout/prompt';

export function LoginPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = useT();
  const sessionUser = useSessionUser();
  const refreshSession = useRefreshSession();
  const hydrated = useHydrated();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(searchError ? authErrorMessage(locale, searchError) : null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionUser?.id) {
      void navigate({ to: '/blog', replace: true });
    }
  }, [navigate, sessionUser?.id]);

  if (sessionUser?.id) {
    return (
      <Page>
        <p className='text-muted-foreground/60'>{t(CHECKING_SESSION)}</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        ssh member@perfectpan.org
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>{t(LOGIN_HINT)}</p>
      <form
        className='mt-4'
        method='post'
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await authClient.signIn.email({
              email,
              password,
              callbackURL: '/blog'
            });

            if (result.error) {
              setError(result.error.message ?? t(SIGN_IN_FAILED));
              return;
            }
            await refreshSession();
          });
        }}
      >
        {/* Keep native submission and controlled input changes behind hydration. */}
        <fieldset disabled={!hydrated} className='m-0 min-w-0 border-0 p-0'>
          <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
            <label htmlFor='email'>
              <span className='text-primary'>▸ </span>
              {t(EMAIL_LABEL)}
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
              className='w-full rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
            <label htmlFor='password'>
              <span className='text-primary'>▸ </span>
              {t(PASSWORD_LABEL)}
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              autoComplete='current-password'
              className='w-full rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className='mt-5 flex flex-wrap gap-3'>
            <button
              type='submit'
              className='cursor-pointer rounded-lg border border-primary bg-primary px-3.5 py-1.75 text-sm text-primary-foreground transition duration-100 hover:brightness-95'
              disabled={isPending}
            >
              {isPending ? t(SIGNING_IN) : t(SIGN_IN)}
            </button>
            <button
              type='button'
              className='cursor-pointer rounded-lg border border-border bg-secondary px-3.5 py-1.75 text-sm text-foreground transition-[border-color,color] duration-100 hover:border-primary hover:text-primary'
              onClick={async () => {
                setError(null);
                const result = await authClient.signIn.social({
                  provider: 'github',
                  callbackURL: '/blog',
                  errorCallbackURL: '/login'
                });
                if (result.error) {
                  setError(result.error.message ?? t(GITHUB_SIGN_IN_FAILED));
                }
              }}
            >
              {t(CONTINUE_WITH_GITHUB)}
            </button>
          </div>
          {error ? (
            <p role='alert' className='my-2.5 text-sm text-destructive'>
              {error}
            </p>
          ) : null}
        </fieldset>
      </form>
      <p className='mb-1 mt-4 text-xs'>
        <span className='text-muted-foreground/60'>{t(NO_ACCOUNT_YET)}</span>{' '}
        <Link to='/signup' className='text-muted-foreground hover:text-foreground'>
          {t(SIGNUP_LINK)}
        </Link>
      </p>
    </Page>
  );
}
