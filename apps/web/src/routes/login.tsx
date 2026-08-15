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
      <div className='f-page'>
        <p className='f-hint pt-8 text-center'>Checking session…</p>
      </div>
    );
  }

  return (
    <div className='f-page'>
      <div className='f-gate'>
        <div className='f-card f-lift f-gate-card'>
          <span
            className='f-sticker badge-top'
            style={{ background: '#FF6B35', color: '#fff' }}
          >
            LOGIN
          </span>
          <h1>登录</h1>
          <p className='sub'>会友可读「会员可读」文章 · 也支持 GitHub</p>
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
            <div className='f-field'>
              <label htmlFor='email'>邮箱 EMAIL</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='f-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='f-field'>
              <label htmlFor='password'>密码 PASSWORD</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                className='f-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='actions'>
              <button
                type='submit'
                className='f-btn f-btn-fill'
                disabled={isPending}
              >
                {isPending ? '登入中…' : '登入 →'}
              </button>
              <button
                type='button'
                className='f-btn'
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
                GitHub
              </button>
            </div>
            {error ? <p className='f-err'>{error}！</p> : null}
          </form>
          <p className='aside'>
            还没账号？ <a href='/signup'>注册一个 →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
