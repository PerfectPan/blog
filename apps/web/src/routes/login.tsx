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
            {error ? <p className='j-err mt-4'>{error}</p> : null}
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
