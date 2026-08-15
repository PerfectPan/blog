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
      <div className='z-page'>
        <p className='z-hint text-center'>正在核对会籍……</p>
      </div>
    );
  }

  return (
    <div className='z-page'>
      <div className='z-gate'>
        <h1>注　冊</h1>
        <p className='sub'>登録すると member になる</p>
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
          <div className='z-field'>
            <label htmlFor='name'>名 号</label>
            <input
              id='name'
              name='name'
              type='text'
              required
              autoComplete='name'
              className='z-input'
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className='z-field'>
            <label htmlFor='email'>邮 箱</label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
              className='z-input'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className='z-field'>
            <label htmlFor='password'>口 令</label>
            <input
              id='password'
              name='password'
              type='password'
              required
              autoComplete='new-password'
              className='z-input'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className='actions'>
            <button
              type='submit'
              className='z-btn z-btn-fill'
              disabled={isPending}
            >
              {isPending ? '建立中…' : '建立账号'}
            </button>
            <button
              type='button'
              className='z-btn'
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
          {error ? <p className='z-err'>{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
