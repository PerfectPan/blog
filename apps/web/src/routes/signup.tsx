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
        <span className='th-cmd'>useradd --join</span>
      </div>
      <p className='th-out th-comment mt-2'>
        # 注册成为 member，可读 member 可见性的文章。
      </p>
      <form
        className='mt-4'
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
        <div className='th-field'>
          <label htmlFor='name'>name</label>
          <input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            className='th-input'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
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
            autoComplete='new-password'
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
            {isPending ? 'creating…' : 'create account'}
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
                setError(result.error.message ?? 'GitHub 注册失败');
              }
            }}
          >
            continue with github
          </button>
        </div>
        {error ? <p className='th-err'>{error}</p> : null}
      </form>
    </div>
  );
}
