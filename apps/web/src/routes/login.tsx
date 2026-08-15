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
        <p className='j-aside'>正在核对会籍……</p>
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
          <h1>入　会</h1>
          <p className='sub'>
            会友可读「会员可读」篇目 · 亦支持 GitHub 介绍入会
          </p>
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
              <label htmlFor='email'>邮　箱</label>
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
              <label htmlFor='password'>口　令</label>
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
                {isPending ? '登入中…' : '登　入'}
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
                GitHub 入会
              </button>
            </div>
            {error ? <p className='j-err mt-4'>{error}</p> : null}
          </form>
          <p className='j-aside'>
            尚未入会？{' '}
            <a href='/signup' className='j-aside-link'>
              注册
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
