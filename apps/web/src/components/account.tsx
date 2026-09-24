import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { authClient } from '../lib/auth-client.js';
import { authErrorMessage } from './auth.js';
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
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const user = sessionData?.user;
  const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
  const [error, setError] = useState<string | null>(
    searchError ? authErrorMessage(searchError) : null,
  );
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadAccounts = useCallback(async () => {
    const result = await authClient.listAccounts();
    if (result.error) {
      setError(result.error.message ?? '读取登录方式失败');
      return;
    }
    setAccounts(result.data);
  }, []);

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
        <p className='text-muted-foreground/60'># checking session…</p>
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
        <dd className='min-w-0 break-all'>{user.email}</dd>
        <dt>role</dt>
        <dd>{user.role ?? 'member'}</dd>
        <dt>password</dt>
        <dd>{hasPassword ? 'set' : 'not set'}</dd>
        <dt>github</dt>
        <dd>{github ? `linked (id ${github.accountId})` : 'not linked'}</dd>
      </dl>
      <p className='mb-1 mt-4 text-xs text-muted-foreground/60'>
        {github
          ? '# 已绑定 GitHub，可以直接用 continue with github 登录这个账号。'
          : '# 绑定后可以用 GitHub 登录这个账号，GitHub 邮箱不必和上面的一致。'}
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
                  setError(result.error.message ?? '绑定 GitHub 失败');
                }
              });
            }}
          >
            link github
          </button>
        )}
      </div>
      {error ? (
        <p role='alert' className='my-2.5 text-sm text-destructive'>
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={unlinkOpen}
        onOpenChange={setUnlinkOpen}
        command='unlink github'
        description='解绑后不能再用 GitHub 登录这个账号，邮箱密码登录不受影响。'
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
              setError(result.error.message ?? '解绑 GitHub 失败');
              return;
            }
            await loadAccounts();
          });
        }}
      />
    </Page>
  );
}
