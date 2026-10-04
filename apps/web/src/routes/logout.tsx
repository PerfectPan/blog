import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import { useT } from '../lib/i18n/context.js';
import {
  LOGGING_OUT,
  LOGOUT_BUTTON_PENDING,
  LOGOUT_FAILED,
  LOGOUT_RETRY,
  LOGOUT_SETTLED,
  LOGOUT_TITLE,
} from '../lib/i18n/messages.js';
import { useRefreshSession } from '../lib/session-user.js';

export const Route = createFileRoute('/logout')({
  component: LogoutPage,
});

function LogoutPage() {
  const navigate = useNavigate();
  const t = useT();
  const refreshSession = useRefreshSession();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const signOut = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await authClient.signOut();
      if (result.error) {
        setError(result.error.message ?? t(LOGOUT_FAILED));
        return;
      }

      await refreshSession();
      navigate({ to: '/blog', replace: true });
    });
  }, [navigate, refreshSession, t]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    signOut();
  }, [signOut]);

  return (
    <section className='mx-auto w-full max-w-[80ch] self-start px-4 pt-8 pb-12 sm:px-6'>
      <h1 className='mb-2 text-3xl font-black'>{t(LOGOUT_TITLE)}</h1>
      <p className='mb-6 opacity-70'>
        {isPending ? t(LOGGING_OUT) : t(LOGOUT_SETTLED)}
      </p>
      {error ? (
        <p className='mb-4 rounded-md bg-destructive/15 px-3 py-2 text-destructive dark:bg-destructive/20 dark:text-destructive'>
          {error}
        </p>
      ) : null}
      <div>
        <button
          type='button'
          onClick={signOut}
          disabled={isPending}
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-muted'
        >
          {isPending ? t(LOGOUT_BUTTON_PENDING) : t(LOGOUT_RETRY)}
        </button>
      </div>
    </section>
  );
}
