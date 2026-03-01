import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
});

function LogoutPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const signOut = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message ?? 'Logout failed');
        return;
      }

      navigate({ to: '/blog', replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    signOut();
  }, [signOut]);

  return (
    <section className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>退出登录</h1>
      <p className='mb-6 opacity-70'>
        {isPending ? '正在退出登录...' : '已退出或退出失败，请重试。'}
      </p>
      {error ? (
        <p className='mb-4 rounded-md bg-red-100 px-3 py-2 text-red-700 dark:bg-red-900/30 dark:text-red-300'>
          {error}
        </p>
      ) : null}
      <div>
        <button
          type='button'
          onClick={signOut}
          disabled={isPending}
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
        >
          {isPending ? 'Logging out...' : 'Retry Logout'}
        </button>
      </div>
    </section>
  );
}
