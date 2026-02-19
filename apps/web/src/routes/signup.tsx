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
    <section className='card'>
      <h1>注册</h1>
      <p className='meta'>注册后默认角色为 member，可在后台升权。</p>

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
        <label htmlFor='name'>Name</label>
        <input
          id='name'
          name='name'
          type='text'
          required
          autoComplete='name'
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete='new-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type='submit' className='btn' disabled={isPending}>
          {isPending ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </section>
  );
}
