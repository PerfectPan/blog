import { useEffect, useState, useTransition } from 'react';
import { useHydrated, useNavigate } from '@tanstack/react-router';
import { authErrorMessage, type Msg } from '../../lib/i18n/messages.js';
import { useLocale, useT } from '../../lib/i18n/context.js';
import { useRefreshSession, useSessionUser } from '../../lib/session-user.js';
import { Page } from '../layout/page';

/**
 * The state, the signed-in redirect and the checking placeholder every auth
 * form page shares: the page supplies where a signed-in user lands, and gets
 * the form fields, the transition wrapper and the early-return node.
 */
export function useAuthFormState(searchError: string | undefined, signedInPath: string, checkingMessage: Msg) {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = useT();
  const sessionUser = useSessionUser();
  const refreshSession = useRefreshSession();
  const hydrated = useHydrated();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(searchError ? authErrorMessage(locale, searchError) : null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (sessionUser?.id) {
      void navigate({ to: signedInPath, replace: true });
    }
  }, [navigate, sessionUser?.id, signedInPath]);

  const checking = sessionUser?.id ? (
    <Page>
      <p className='text-muted-foreground/60'>{t(checkingMessage)}</p>
    </Page>
  ) : undefined;

  const submitInTransition = (run: () => Promise<void>): void => startTransition(run);

  return {
    locale,
    t,
    hydrated,
    refreshSession,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    isPending,
    submitInTransition,
    /** When set, the page renders nothing else: the session check is in flight. */
    checking
  };
}
