import { authClient } from '../../lib/auth-client.js';
import { CONTINUE_WITH_GITHUB, type Msg } from '../../lib/i18n/messages.js';
import { useT } from '../../lib/i18n/context.js';

/** The GitHub OAuth button both auth forms offer; failures land back on the form's own error display. */
export function GithubAuthButton(props: {
  errorCallbackURL: string;
  failMessage: Msg;
  setError: (error: string | null) => void;
}) {
  const t = useT();
  return (
    <button
      type='button'
      className='cursor-pointer rounded-lg border border-border bg-secondary px-3.5 py-1.75 text-sm text-foreground transition-[border-color,color] duration-100 hover:border-primary hover:text-primary'
      onClick={async () => {
        props.setError(null);
        const result = await authClient.signIn.social({
          provider: 'github',
          callbackURL: '/blog',
          errorCallbackURL: props.errorCallbackURL
        });
        if (result.error) {
          props.setError(result.error.message ?? t(props.failMessage));
        }
      }}
    >
      {t(CONTINUE_WITH_GITHUB)}
    </button>
  );
}
