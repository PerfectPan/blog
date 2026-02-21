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
    <section className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>登录</h1>
      <p className='mb-6 opacity-70'>支持邮箱密码和 GitHub OAuth。</p>

      {error ? (
        <p role='alert' className='mb-4 text-sm text-red-700 dark:text-red-300'>
          {error}
        </p>
      ) : null}

      <form
        className='grid max-w-[420px] gap-3'
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
        <label htmlFor='email' className='font-semibold'>
          Email
        </label>
        <input
          id='email'
          name='email'
          type='email'
          required
          autoComplete='email'
          className='rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor='password' className='font-semibold'>
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          required
          autoComplete='current-password'
          className='rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type='submit'
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
          disabled={isPending}
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <button
        type='button'
        className='mt-3 rounded-md border border-[#d0d0d3] px-4 py-2 font-semibold transition-colors hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800'
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
