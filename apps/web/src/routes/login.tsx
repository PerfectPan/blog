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
      <div className='g-page'>
        <p className='g-hint pt-8 text-center'>Checking session…</p>
      </div>
    );
  }

  return (
    <div className='g-page'>
      <div className='g-auth'>
        <div className='g-auth-head'>
          <h1>登录</h1>
          <span className='g-cnt'>AUTH / 01</span>
        </div>
        <div className='g-panel g-auth-card'>
          <span className='g-glowline' aria-hidden='true' />
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
            <div className='g-field'>
              <label htmlFor='email'>EMAIL</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='g-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='g-field'>
              <label htmlFor='password'>PASSWORD</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                className='g-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='g-actions'>
              <button
                type='submit'
                className='g-btn g-btn-grad'
                disabled={isPending}
              >
                {isPending ? '登录中…' : '登录'}
              </button>
              <button
                type='button'
                className='g-btn'
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
            {error ? <p className='g-err'>{error}</p> : null}
          </form>
          <p className='g-aside'>
            没有账号？<a href='/signup'>注册 →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
