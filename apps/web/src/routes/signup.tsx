import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useTransition } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>注册</h1>
      <p className='mb-6 opacity-70'>注册后默认角色为 member，可在后台升权。</p>

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
        <label htmlFor='name' className='font-semibold'>
          Name
        </label>
        <input
          id='name'
          name='name'
          type='text'
          required
          autoComplete='name'
          className='rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete='new-password'
          className='rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type='submit'
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
          disabled={isPending}
        >
          {isPending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </section>
  );
}
