import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import {
  type AuthMessages,
  authZh,
  useAuth,
} from '../lib/i18n/messages/index.js';
import { Page, Prompt } from './page.js';

// Better Auth reports OAuth and email-verification failures as
// `?error=<code>` on the callback URL; the copy for the codes a user can
// cause lives in the auth dictionary. Callers without a locale bundle
// (account.tsx today) still get the zh messages via the default.
export function authErrorMessage(
  code: string,
  messages: AuthMessages = authZh,
): string {
  return messages.authErrors[code] ?? messages.authErrorFallback(code);
}

export function LoginPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError, auth) : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionData?.user?.id) {
      navigate({ to: '/blog', replace: true });
    }
  }, [navigate, sessionData?.user?.id]);

  if (sessionData?.user?.id || isSessionPending) {
    return (
      <Page>
        <p className='text-muted-foreground/60'>{auth.checkingSession}</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        ssh member@perfectpan.org
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        {auth.loginHint}
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
              setError(result.error.message ?? auth.signInFailed);
              return;
            }
          });
        }}
      >
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='email'>
            <span className='text-primary'>▸ </span>
            {auth.emailLabel}
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
            {auth.passwordLabel}
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
            {isPending ? auth.signingIn : auth.signIn}
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
                setError(result.error.message ?? auth.githubSignInFailed);
              }
            }}
          >
            {auth.continueWithGithub}
          </button>
        </div>
        {error ? (
          <p role='alert' className='my-2.5 text-sm text-destructive'>
            {error}
          </p>
        ) : null}
      </form>
      <p className='mb-1 mt-4 text-xs'>
        <span className='text-muted-foreground/60'>{auth.noAccountYet}</span>{' '}
        <Link
          to='/signup'
          className='text-muted-foreground hover:text-foreground'
        >
          {auth.signupLink}
        </Link>
      </p>
    </Page>
  );
}

export function SignupPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError, auth) : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Wait for Better Auth's session refresh before entering /account;
    // navigating on the signup response can still expose the guest store.
    if (sessionData?.user?.id) {
      navigate({ to: '/account', replace: true });
    }
  }, [navigate, sessionData?.user?.id]);

  if (sessionData?.user?.id || isSessionPending) {
    return (
      <Page>
        <p className='text-muted-foreground/60'>{auth.checkingSession}</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        useradd --join
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        {auth.signupHint}
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
              setError(result.error.message ?? auth.signUpFailed);
              return;
            }
          });
        }}
      >
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='name'>
            <span className='text-primary'>▸ </span>
            {auth.nameLabel}
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
            {auth.emailLabel}
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
            {auth.passwordLabel}
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
            {isPending ? auth.creating : auth.createAccount}
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
                setError(result.error.message ?? auth.githubSignUpFailed);
              }
            }}
          >
            {auth.continueWithGithub}
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
  const auth = useAuth();
  const { error: searchError } = (search ?? {}) as { error?: string };
  const errorLabel =
    searchError === 'missing'
      ? auth.unlockErrorMissing
      : searchError === 'invalid'
        ? auth.unlockErrorInvalid
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
      <p className='mb-1 text-xs text-muted-foreground/60'>{auth.unlockHint}</p>
      <form method='post' className='mt-4'>
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='password'>
            <span className='text-primary'>▸ </span>
            {auth.unlockPasswordLabel}
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
            {auth.sudoUnlock}
          </button>
          <Link
            to='/blog/$slug'
            params={{ slug }}
            className='text-muted-foreground hover:text-foreground'
          >
            {auth.backToPost}
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
