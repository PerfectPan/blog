import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../../lib/auth-client.js';

export function TerminalLoginPage() {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionData?.user?.id) {
      navigate({ to: '/blog', replace: true });
    }
  }, [navigate, sessionData?.user?.id]);

  if (sessionData?.user?.id || isSessionPending) {
    return (
      <div className='th-page'>
        <p className='th-comment'># checking session…</p>
      </div>
    );
  }

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>ssh member@perfectpan.org</span>
      </div>
      <p className='th-out th-comment mt-2'>
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

            navigate({ to: '/blog' });
          });
        }}
      >
        <div className='th-field'>
          <label htmlFor='email'>email</label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className='th-input'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='password'>password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='current-password'
            className='th-input'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button
            type='submit'
            className='th-btn th-btn-primary'
            disabled={isPending}
          >
            {isPending ? 'signing in…' : 'sign in'}
          </button>
          <button
            type='button'
            className='th-btn'
            onClick={async () => {
              setError(null);
              const result = await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/blog',
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
          <p role='alert' className='th-err'>
            {error}
          </p>
        ) : null}
      </form>
      <p className='th-out mt-4'>
        <span className='th-comment'># 还没有账号？</span>{' '}
        <Link to='/signup'>signup</Link>
      </p>
    </div>
  );
}

export function TerminalSignupPage() {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionData?.user?.id) {
      navigate({ to: '/blog', replace: true });
    }
  }, [navigate, sessionData?.user?.id]);

  if (sessionData?.user?.id || isSessionPending) {
    return (
      <div className='th-page'>
        <p className='th-comment'># checking session…</p>
      </div>
    );
  }

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>useradd --join</span>
      </div>
      <p className='th-out th-comment mt-2'>
        # 注册成为 member，可读 member 可见性的文章。
      </p>
      <form
        className='mt-4'
        method='post'
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await authClient.signUp.email({
              email,
              password,
              name,
              callbackURL: '/blog',
            });

            if (result.error) {
              setError(result.error.message ?? '注册失败');
              return;
            }

            navigate({ to: '/blog' });
          });
        }}
      >
        <div className='th-field'>
          <label htmlFor='name'>name</label>
          <input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            className='th-input'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='email'>email</label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className='th-input'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='password'>password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            className='th-input'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button
            type='submit'
            className='th-btn th-btn-primary'
            disabled={isPending}
          >
            {isPending ? 'creating…' : 'create account'}
          </button>
          <button
            type='button'
            className='th-btn'
            onClick={async () => {
              setError(null);
              const result = await authClient.signIn.social({
                provider: 'github',
                callbackURL: '/blog',
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
          <p role='alert' className='th-err'>
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}

export function TerminalUnlockPage({
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
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>cat posts/{slug}.md</span>
      </div>
      <p className='th-out'>
        <span className='th-nf-big'>
          cat: posts/{slug}.md: Permission denied
        </span>
      </p>
      <p className='th-out th-comment'>
        # 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。
      </p>
      <form method='post' className='mt-4'>
        <div className='th-field'>
          <label htmlFor='password'>password for this post</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='th-input'
          />
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          <button type='submit' className='th-btn th-btn-primary'>
            sudo unlock
          </button>
          <Link to='/blog/$slug' params={{ slug }} className='th-cd'>
            ← 返回文章
          </Link>
        </div>
        {errorLabel ? (
          <p role='alert' className='th-err'>
            {errorLabel}
          </p>
        ) : null}
      </form>
    </div>
  );
}
