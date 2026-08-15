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
          <h1>注册</h1>
          <p className='sub'>注册后默认角色为 member，可在后台升权。</p>
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
            <div className='j-field'>
              <label htmlFor='name'>Name</label>
              <input
                id='name'
                name='name'
                type='text'
                required
                autoComplete='name'
                className='j-input'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                autoComplete='new-password'
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
                {isPending ? 'Creating account...' : 'Sign Up'}
              </button>
            </div>
            {error ? <p className='j-err mt-4'>{error}</p> : null}
          </form>
        </div>
      </div>
    </div>
  );
}
