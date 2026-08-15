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
      <div className='c-page'>
        <p className='c-sec-label'>Checking session…</p>
      </div>
    );
  }

  return (
    <div className='c-page'>
      <div className='c-auth'>
        <div className='c-auth-head'>
          <h1>注册</h1>
          <span className='c-no'>AUTH / 02</span>
        </div>
        <div className='c-auth-card'>
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
            <div className='c-field'>
              <label htmlFor='name'>Name</label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                className='c-input'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                autoComplete='new-password'
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
                {isPending ? '创建中…' : '创建账号'}
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
                    setError(result.error.message ?? 'GitHub 注册失败');
                  }
                }}
              >
                GitHub 注册
              </button>
            </div>
            {error ? <p className='c-err'>{error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
