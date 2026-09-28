import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import { authErrorMessage, useCopy } from '../lib/i18n/copy.js';
import { ConfirmDialog } from './confirm-dialog.js';
import { Page, Prompt } from './page.js';

type LinkedAccount = { providerId: string; accountId: string };

const BTN_PRIMARY =
  'cursor-pointer rounded-lg border border-primary bg-primary px-3.5 py-1.75 text-sm text-primary-foreground transition duration-100 hover:brightness-95';
const BTN_SECONDARY =
  'cursor-pointer rounded-lg border border-border bg-secondary px-3.5 py-1.75 text-sm text-foreground transition-[border-color,color] duration-100 hover:border-primary hover:text-primary';

/** Signed-in account page: who you are, and link / unlink GitHub sign-in. */
export function AccountPage({ searchError }: { searchError?: string }) {
  const navigate = useNavigate();
  const { auth, pages: t } = useCopy();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const user = sessionData?.user;
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError, auth) : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadAccounts = useCallback(async () => {
    try {
      const result = await authClient.listAccounts();
      if (result.error) {
        setError(result.error.message ?? t.loadAccountsFailed);
        return;
      }
      setAccounts(result.data);
    } catch {
      setError(t.loadAccountsFailedRetry);
    }
  }, [t]);

  useEffect(() => {
    if (!isSessionPending && !user) {
      navigate({ to: '/login', replace: true });
    }
  }, [isSessionPending, navigate, user]);

  useEffect(() => {
    if (user?.id) {
      loadAccounts();
    }
  }, [loadAccounts, user?.id]);

  if (!user || !accounts) {
    return (
      <Page>
        {error ? (
          <>
            <p role='alert' className='my-2.5 text-sm text-destructive'>
              {error}
            </p>
            <button
              type='button'
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(loadAccounts);
              }}
            >
              retry
            </button>
          </>
        ) : (
          <p className='text-muted-foreground/60'># checking session…</p>
        )}
      </Page>
    );
  }

  const github = accounts.find((account) => account.providerId === 'github');
  const hasPassword = accounts.some(
    (account) => account.providerId === 'credential',
  );

  return (
    <Page>
      <Prompt
        user={user.role ?? 'member'}
        host='perfectpan.org'
        cwd='~ %'
        typed
      >
        id
      </Prompt>
      <dl className='mt-2 grid max-w-105 grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm [&_dt]:text-muted-foreground'>
        <dt>email</dt>
        <dd className='min-w-0 break-all'>
          {user.email}{' '}
          <span
            className={
              user.emailVerified ? 'text-muted-foreground' : 'text-destructive'
            }
          >
            ({user.emailVerified ? t.emailVerified : t.emailNotVerified})
          </span>
        </dd>
        <dt>role</dt>
        <dd>{user.role ?? 'member'}</dd>
        <dt>password</dt>
        <dd>{hasPassword ? t.passwordSet : t.passwordNotSet}</dd>
        <dt>github</dt>
        <dd>{github ? t.githubLinked(github.accountId) : t.githubNotLinked}</dd>
      </dl>
      {user.emailVerified ? null : (
        <div className='mt-4'>
          <p className='mb-1 text-xs text-muted-foreground/60'>
            # {t.verifyEmailHint}
          </p>
          <button
            type='button'
            className={BTN_SECONDARY}
            disabled={isPending}
            onClick={() => {
              setError(null);
              setNotice(null);
              startTransition(async () => {
                const result = await authClient.sendVerificationEmail({
                  email: user.email,
                  callbackURL: '/account',
                });
                if (result.error) {
                  setError(result.error.message ?? t.sendVerificationFailed);
                  return;
                }
                setNotice(t.verificationSent(user.email));
              });
            }}
          >
            send verification email
          </button>
        </div>
      )}
      <p className='mb-1 mt-4 text-xs text-muted-foreground/60'>
        {github ? `# ${t.githubLinkedHint}` : `# ${t.githubNotLinkedHint}`}
      </p>
      <div className='mt-4 flex flex-wrap gap-3'>
        {github ? (
          // Better Auth refuses to unlink the last sign-in method, so the
          // button only shows when a password is there to fall back on.
          hasPassword ? (
            <button
              type='button'
              className={BTN_SECONDARY}
              disabled={isPending}
              onClick={() => setUnlinkOpen(true)}
            >
              unlink github
            </button>
          ) : null
        ) : (
          <button
            type='button'
            className={BTN_PRIMARY}
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await authClient.linkSocial({
                  provider: 'github',
                  callbackURL: '/account',
                  errorCallbackURL: '/account',
                });
                if (result.error) {
                  setError(result.error.message ?? t.linkGithubFailed);
                }
              });
            }}
          >
            link github
          </button>
        )}
      </div>
      {notice ? (
        <p role='status' className='my-2.5 text-sm text-muted-foreground'>
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role='alert' className='my-2.5 text-sm text-destructive'>
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={unlinkOpen}
        onOpenChange={setUnlinkOpen}
        command='unlink github'
        description={t.unlinkConfirmDescription}
        confirmLabel='unlink'
        pending={isPending}
        onConfirm={() => {
          setError(null);
          startTransition(async () => {
            const result = await authClient.unlinkAccount({
              providerId: 'github',
            });
            setUnlinkOpen(false);
            if (result.error) {
              setError(result.error.message ?? t.unlinkGithubFailed);
              return;
            }
            await loadAccounts();
          });
        }}
      />
    </Page>
  );
}
