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
      <div className='e-board'>
        <p className='e-aside'>CHECKING SESSION…</p>
      </div>
    );
  }

  return (
    <div className='e-board'>
      <section className='e-sheet' style={{ maxWidth: 540, margin: '0 auto' }}>
        <span className='e-tick tl' aria-hidden='true' />
        <span className='e-tick tr' aria-hidden='true' />
        <span className='e-tick bl' aria-hidden='true' />
        <span className='e-tick br' aria-hidden='true' />
        <div className='e-sheet-head'>
          <span className='dwg'>DWG NO. PP-AUTH-01</span>
          <span className='dwg'>
            REV <span className='rev'>A</span>
          </span>
        </div>
        <div className='e-gate'>
          <h1>SIGN IN / 登录</h1>
          <p className='sub'>会友可读 MEMBER 图纸 · 亦支持 GITHUB OAUTH</p>
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
            <div className='e-field'>
              <label htmlFor='email'>EMAIL</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                autoComplete='email'
                className='e-input'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className='e-field'>
              <label htmlFor='password'>PASSWORD</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                autoComplete='current-password'
                className='e-input'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className='e-actions'>
              <button
                type='submit'
                className='e-btn e-btn-fill'
                disabled={isPending}
              >
                {isPending ? 'SIGNING IN…' : 'SIGN IN'}
              </button>
              <button
                type='button'
                className='e-btn'
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
                GITHUB
              </button>
            </div>
            {error ? <p className='e-err'>{error}</p> : null}
          </form>
          <p className='e-aside'>
            尚未注册？ <a href='/signup'>SIGN UP ↗</a>
          </p>
        </div>
        <div className='e-titleblock'>
          <span className='cell'>
            <b>PP-AUTH-01</b>
          </span>
          <span className='cell'>
            TITLE<b>登录</b>
          </span>
        </div>
      </section>
    </div>
  );
}
