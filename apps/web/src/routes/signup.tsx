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
      <div className='g-page'>
        <p className='g-hint pt-8 text-center'>Checking session…</p>
      </div>
    );
  }

  return (
    <div className='g-page'>
      <div className='g-auth'>
        <div className='g-auth-head'>
          <h1>注册</h1>
          <span className='g-cnt'>AUTH / 02</span>
        </div>
        <div className='g-panel g-auth-card'>
          <span className='g-glowline' aria-hidden='true' />
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
            <div className='g-field'>
              <label htmlFor='name'>NAME</label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                className='g-input'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                autoComplete='new-password'
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
                {isPending ? '创建中…' : '创建账号'}
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
                    setError(result.error.message ?? 'GitHub 注册失败');
                  }
                }}
              >
                GitHub 注册
              </button>
            </div>
            {error ? <p className='g-err'>{error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
