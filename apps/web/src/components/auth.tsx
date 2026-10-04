import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import { useLocale, useT } from '../lib/i18n/context.js';
import {
  authErrorMessage,
  BACK_TO_POST,
  CHECKING_SESSION,
  CONTINUE_WITH_GITHUB,
  CREATE_ACCOUNT,
  CREATING,
  EMAIL_LABEL,
  GITHUB_SIGN_IN_FAILED,
  GITHUB_SIGN_UP_FAILED,
  LOGIN_HINT,
  NAME_LABEL,
  NO_ACCOUNT_YET,
  PASSWORD_LABEL,
  SIGN_IN,
  SIGN_IN_FAILED,
  SIGN_UP_FAILED,
  SIGNING_IN,
  SIGNUP_HINT,
  SIGNUP_LINK,
  SUDO_UNLOCK,
  UNLOCK_ERROR_INVALID,
  UNLOCK_ERROR_MISSING,
  UNLOCK_HINT,
  UNLOCK_PASSWORD_LABEL,
} from '../lib/i18n/messages.js';
import { useRefreshSession, useSessionUser } from '../lib/session-user.js';
import { Page, Prompt } from './page.js';

export function LoginPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = useT();
  const sessionUser = useSessionUser();
  const refreshSession = useRefreshSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(locale, searchError) : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionUser?.id) {
      navigate({ to: '/blog', replace: true });
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
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        {t(LOGIN_HINT)}
      </p>
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
              callbackURL: '/blog',
            });

            if (result.error) {
              setError(result.error.message ?? t(SIGN_IN_FAILED));
              return;
            }
            await refreshSession();
          });
        }}
      >
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
                errorCallbackURL: '/login',
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
      </form>
      <p className='mb-1 mt-4 text-xs'>
        <span className='text-muted-foreground/60'>{t(NO_ACCOUNT_YET)}</span>{' '}
        <Link
          to='/signup'
          className='text-muted-foreground hover:text-foreground'
        >
          {t(SIGNUP_LINK)}
        </Link>
      </p>
    </Page>
  );
}

export function SignupPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = useT();
  const sessionUser = useSessionUser();
  const refreshSession = useRefreshSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(locale, searchError) : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionUser?.id) {
      navigate({ to: '/account', replace: true });
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
        useradd --join
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        {t(SIGNUP_HINT)}
      </p>
      <form
        className='mt-4'
        method='post'
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          startTransition(async () => {
            // callbackURL is where the verification link lands.
            const result = await authClient.signUp.email({
              email,
              password,
              name,
              callbackURL: '/account',
            });

            if (result.error) {
              setError(result.error.message ?? t(SIGN_UP_FAILED));
              return;
            }
            await refreshSession();
          });
        }}
      >
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='name'>
            <span className='text-primary'>▸ </span>
            {t(NAME_LABEL)}
          </label>
          <input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            className='w-full rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
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
            autoComplete='new-password'
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
            {isPending ? t(CREATING) : t(CREATE_ACCOUNT)}
          </button>
          <button
            type='button'
            className='cursor-pointer rounded-lg border border-border bg-secondary px-3.5 py-1.75 text-sm text-foreground transition-[border-color,color] duration-100 hover:border-primary hover:text-primary'
            onClick={async () => {
              setError(null);
              const result = await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/blog',
                errorCallbackURL: '/signup',
              });
              if (result.error) {
                setError(result.error.message ?? t(GITHUB_SIGN_UP_FAILED));
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
      </form>
    </Page>
  );
}

export function UnlockPage({
  slug,
  search,
}: {
  slug: string;
  search?: Record<string, string | undefined>;
}) {
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
        <span className='text-destructive'>
          cat: posts/{slug}.md: Permission denied
        </span>
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
          <Link
            to='/blog/$slug'
            params={{ slug }}
            className='text-muted-foreground hover:text-foreground'
          >
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
