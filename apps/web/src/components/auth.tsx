import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import { Page, Prompt } from './page.js';

// Better Auth reports OAuth and email-verification failures as
// `?error=<code>` on the callback URL; these are the codes a user can cause.
const AUTH_ERRORS: Record<string, string> = {
  account_not_linked:
    '这个邮箱已经有账号但还没验证。先用邮箱密码登录，再到 account 页验证邮箱或绑定 GitHub。',
  account_already_linked_to_different_user:
    '这个 GitHub 账号已经绑定了另一个用户。',
  unable_to_link_account: 'GitHub 邮箱未验证，无法绑定。',
  invalid_token: '验证链接无效，请重新发送验证邮件。',
  token_expired: '验证链接已过期，请重新发送验证邮件。',
};

export function authErrorMessage(code: string): string {
  return AUTH_ERRORS[code] ?? `GitHub 登录失败（${code}）`;
}

export function LoginPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError) : null,
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
        <p className='text-muted-foreground/60'># checking session…</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        ssh member@perfectpan.org
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        # 邮箱密码登录；或者走 GitHub OAuth。
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
              setError(result.error.message ?? '登录失败');
              return;
            }
          });
        }}
      >
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='email'>
            <span className='text-primary'>▸ </span>email
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
            <span className='text-primary'>▸ </span>password
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
            {isPending ? 'signing in…' : 'sign in'}
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
                setError(result.error.message ?? 'GitHub 登录失败');
              }
            }}
          >
            continue with github
          </button>
        </div>
        {error ? (
          <p role='alert' className='my-2.5 text-sm text-destructive'>
            {error}
          </p>
        ) : null}
      </form>
      <p className='mb-1 mt-4 text-xs'>
        <span className='text-muted-foreground/60'># 还没有账号？</span>{' '}
        <Link
          to='/signup'
          className='text-muted-foreground hover:text-foreground'
        >
          signup
        </Link>
      </p>
    </Page>
  );
}

export function SignupPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError) : null,
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
        <p className='text-muted-foreground/60'># checking session…</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        useradd --join
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>
        # 注册成为 member，可读 member 可见性的文章。
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
              setError(result.error.message ?? '注册失败');
              return;
            }
          });
        }}
      >
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='name'>
            <span className='text-primary'>▸ </span>name
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
            <span className='text-primary'>▸ </span>email
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
            <span className='text-primary'>▸ </span>password
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
            {isPending ? 'creating…' : 'create account'}
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
                setError(result.error.message ?? 'GitHub 注册失败');
              }
            }}
          >
            continue with github
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
  const { error: searchError } = (search ?? {}) as { error?: string };
  const errorLabel =
    searchError === 'missing'
      ? '请输入访问密码'
      : searchError === 'invalid'
        ? '密码错误，请重试'
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
      <p className='mb-1 text-xs text-muted-foreground/60'>
        # 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。
      </p>
      <form method='post' className='mt-4'>
        <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
          <label htmlFor='password'>
            <span className='text-primary'>▸ </span>password for this post
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
            sudo unlock
          </button>
          <Link
            to='/blog/$slug'
            params={{ slug }}
            className='text-muted-foreground hover:text-foreground'
          >
            ← 返回文章
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
