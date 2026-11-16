import { Link } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client.js';
import {
  CHECKING_SESSION,
  GITHUB_SIGN_IN_FAILED,
  LOGIN_HINT,
  NO_ACCOUNT_YET,
  SIGN_IN,
  SIGN_IN_FAILED,
  SIGNING_IN,
  SIGNUP_LINK
} from '../../lib/i18n/messages.js';
import { AuthForm } from './auth-form';
import { EmailPasswordFields } from './email-password-fields';
import { useAuthFormState } from './auth-session';
import { Page } from '../layout/page';

export function LoginPage({ searchError }: { searchError?: string }) {
  const auth = useAuthFormState(searchError, '/blog', CHECKING_SESSION);

  if (auth.checking) {
    return auth.checking;
  }

  const onEmailSubmit = () =>
    auth.submitInTransition(async () => {
      const result = await authClient.signIn.email({
        email: auth.email,
        password: auth.password,
        callbackURL: '/blog'
      });

      if (result.error) {
        auth.setError(result.error.message ?? auth.t(SIGN_IN_FAILED));
        return;
      }
      await auth.refreshSession();
    });

  return (
    <Page>
      <AuthForm
        promptCommand='ssh member@perfectpan.org'
        hint={auth.t(LOGIN_HINT)}
        hydrated={auth.hydrated}
        isPending={auth.isPending}
        setError={auth.setError}
        error={auth.error}
        errorCallbackURL='/login'
        githubFailMessage={GITHUB_SIGN_IN_FAILED}
        submitLabel={auth.isPending ? auth.t(SIGNING_IN) : auth.t(SIGN_IN)}
        onEmailSubmit={onEmailSubmit}
        fields={
          <EmailPasswordFields
            email={auth.email}
            setEmail={auth.setEmail}
            password={auth.password}
            setPassword={auth.setPassword}
            passwordAutoComplete='current-password'
          />
        }
        footer={
          <p className='mb-1 mt-4 text-xs'>
            <span className='text-muted-foreground/60'>{auth.t(NO_ACCOUNT_YET)}</span>{' '}
            <Link to='/signup' className='text-muted-foreground hover:text-foreground'>
              {auth.t(SIGNUP_LINK)}
            </Link>
          </p>
        }
      />
    </Page>
  );
}
