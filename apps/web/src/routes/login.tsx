import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useTransition } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className='card'>
      <h1>登录</h1>
      <p className='meta'>支持邮箱密码和 GitHub OAuth。</p>

      {error ? (
        <p role='alert' className='meta' style={{ color: '#b3261e' }}>
          {error}
        </p>
      ) : null}

      <form
        className='auth-form'
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
        <label htmlFor='email'>Email</label>
        <input
          id='email'
          name='email'
          type='email'
          required
          autoComplete='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor='password'>Password</label>
        <input
          id='password'
          name='password'
          type='password'
          required
          autoComplete='current-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type='submit' className='btn' disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <button
        type='button'
        className='btn secondary'
        style={{ marginTop: '0.75rem' }}
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
        Continue with GitHub
      </button>
    </section>
  );
}
