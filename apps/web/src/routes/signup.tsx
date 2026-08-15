import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';

export const Route = createFileRoute('/signup')({
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-up/email',
          },
        }),
    },
  },
  component: SignUpPage,
});

function SignUpPage() {
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
            style={{ background: '#7C5CFF', color: '#fff' }}
          >
            SIGN UP
          </span>
          <h1>注册</h1>
          <p className='sub'>注册即成为 member</p>
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
            <div className='f-field'>
              <label htmlFor='name'>名号 NAME</label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                className='f-input'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                autoComplete='new-password'
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
                {isPending ? '创建中…' : '创建账号！'}
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
                    setError(result.error.message ?? 'GitHub 注册失败');
                  }
                }}
              >
                GitHub
              </button>
            </div>
            {error ? <p className='f-err'>{error}！</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
