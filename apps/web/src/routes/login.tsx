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
        {error ? <p className='th-err'>{error}</p> : null}
      </form>
      <p className='th-out mt-4'>
        <span className='th-comment'># 还没有账号？</span>{' '}
        <a href='/signup'>signup</a>
      </p>
    </div>
  );
}
