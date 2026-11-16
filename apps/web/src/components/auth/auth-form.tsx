import type { ReactNode } from 'react';
import type { Msg } from '../../lib/i18n/messages.js';
import { Prompt } from '../layout/prompt';
import { AuthError } from './auth-error';
import { GithubAuthButton } from './github-auth-button';

/**
 * The shell both auth forms fill in: the terminal prompt with its hint, the
 * hydrated fieldset, the shared field/button rows, and the error line. The
 * page supplies its own fields, the submit label, the email handler and the
 * GitHub callbacks.
 */
export function AuthForm(props: {
  /** The shell command line the terminal prompt types out. */
  promptCommand: string;
  hint: string;
  hydrated: boolean;
  isPending: boolean;
  setError: (error: string | null) => void;
  error: string | null;
  errorCallbackURL: string;
  githubFailMessage: Msg;
  submitLabel: string;
  onEmailSubmit: () => void;
  fields: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <Prompt user='guest' host='perfectpan.org' cwd='~ %' typed>
        {props.promptCommand}
      </Prompt>
      <p className='mb-1 text-xs text-muted-foreground/60 mt-2'>{props.hint}</p>
      <form
        className='mt-4'
        method='post'
        onSubmit={(event) => {
          event.preventDefault();
          props.setError(null);
          props.onEmailSubmit();
        }}
      >
        {/* Keep native submission and controlled input changes behind hydration. */}
        <fieldset disabled={!props.hydrated} className='m-0 min-w-0 border-0 p-0'>
          {props.fields}
          <div className='mt-5 flex flex-wrap gap-3'>
            <button
              type='submit'
              className='cursor-pointer rounded-lg border border-primary bg-primary px-3.5 py-1.75 text-sm text-primary-foreground transition duration-100 hover:brightness-95'
              disabled={props.isPending}
            >
              {props.submitLabel}
            </button>
            <GithubAuthButton
              errorCallbackURL={props.errorCallbackURL}
              failMessage={props.githubFailMessage}
              setError={props.setError}
            />
          </div>
          <AuthError error={props.error} />
        </fieldset>
      </form>
      {props.footer}
    </>
  );
}
