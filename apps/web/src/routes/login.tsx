import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';

export const Route = createFileRoute('/login')({
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-in/email',
          },
        }),
    },
  },
  component: LoginPage,
});

function LoginPage() {
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
      <div className='c-page'>
        <p className='c-sec-label'>Checking session…</p>
      </div>
    );
  }

  return (
    <div className='c-page'>
      <div className='c-auth'>
        <div className='c-auth-head'>
          <h1>登录</h1>
          <span className='c-no'>AUTH / 01</span>
        </div>
        <div className='c-auth-card'>
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
            <div className='c-field'>
              <label htmlFor='email'>Email</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='c-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='c-field'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                className='c-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='c-actions'>
              <button
                type='submit'
                className='c-btn c-btn-solid'
                disabled={isPending}
              >
                {isPending ? '登录中…' : '登录'}
              </button>
              <button
                type='button'
                className='c-btn c-btn-ghost'
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
                GitHub 登录
              </button>
            </div>
            {error ? <p className='c-err'>{error}</p> : null}
          </form>
          <p className='c-aside'>
            登录后可读 member 篇目 · <a href='/signup'>没有账号？注册</a>
          </p>
        </div>
      </div>
    </div>
  );
}
