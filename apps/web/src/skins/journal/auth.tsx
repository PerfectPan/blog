import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../../lib/auth-client.js';

export function JournalLoginPage() {
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
      <div className='j-sheet'>
        <p className='j-aside'>Checking session...</p>
      </div>
    );
  }

  return (
    <div className='j-sheet'>
      <div className='j-gate'>
        <div className='j-gate-card'>
          <span className='j-seal' aria-hidden='true'>
            潘
          </span>
          <h1>登录</h1>
          <p className='sub'>支持邮箱密码和 GitHub OAuth。</p>
          <form
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
            <div className='j-field'>
              <label htmlFor='email'>Email</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='j-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='j-field'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                className='j-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='j-actions'>
              <button
                type='submit'
                className='j-btn j-btn-red'
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type='button'
                className='j-btn'
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
                Continue with GitHub
              </button>
            </div>
            {error ? (
              <p role='alert' className='j-err mt-4'>
                {error}
              </p>
            ) : null}
          </form>
          <p className='j-aside'>
            还没有账号？{' '}
            <a href='/signup' style={{ color: 'var(--j-red)' }}>
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function JournalSignupPage() {
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
      <div className='j-sheet'>
        <p className='j-aside'>Checking session...</p>
      </div>
    );
  }

  return (
    <div className='j-sheet'>
      <div className='j-gate'>
        <div className='j-gate-card'>
          <span className='j-seal' aria-hidden='true'>
            潘
          </span>
          <h1>注册</h1>
          <p className='sub'>注册后默认角色为 member，可在后台升权。</p>
          <form
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
            <div className='j-field'>
              <label htmlFor='name'>Name</label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                className='j-input'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className='j-field'>
              <label htmlFor='email'>Email</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='j-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='j-field'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='new-password'
                className='j-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='j-actions'>
              <button
                type='submit'
                className='j-btn j-btn-red'
                disabled={isPending}
              >
                {isPending ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
            {error ? (
              <p role='alert' className='j-err mt-4'>
                {error}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

export function JournalUnlockPage({
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
    <div className='j-sheet'>
      <div className='j-gate'>
        <div className='j-gate-card text-center'>
          <div className='j-lockmark' aria-hidden='true'>
            锁
          </div>
          <h1>输入文章访问密码</h1>
          <p className='sub'>这篇文章使用了单文密码保护。</p>
          <form method='post' className='text-left'>
            <div className='j-field'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='j-input'
              />
            </div>
            {errorLabel ? (
              <p role='alert' className='j-err text-center'>
                {errorLabel}
              </p>
            ) : null}
            <div className='j-actions justify-center'>
              <button type='submit' className='j-btn j-btn-red'>
                Unlock
              </button>
            </div>
          </form>
          <p className='j-aside'>
            <Link
              to='/blog/$slug'
              params={{ slug }}
              style={{ color: 'var(--j-indigo)' }}
            >
              返回文章页
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
