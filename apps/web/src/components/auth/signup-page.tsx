import { authClient } from '../../lib/auth-client.js';
import { AuthForm } from './auth-form';
import { AuthField } from './auth-field';
import { EmailPasswordFields } from './email-password-fields';
import {
  CHECKING_SESSION,
  CREATE_ACCOUNT,
  CREATING,
  GITHUB_SIGN_UP_FAILED,
  NAME_LABEL,
  SIGN_UP_FAILED,
  SIGNUP_HINT
} from '../../lib/i18n/messages.js';
import { useState } from 'react';
import { useAuthFormState } from './auth-session';
import { Page } from '../layout/page';

export function SignupPage({ searchError }: { searchError?: string }) {
  const [name, setName] = useState('');
  const auth = useAuthFormState(searchError, '/account', CHECKING_SESSION);

  if (auth.checking) {
    return auth.checking;
  }

  const onEmailSubmit = () =>
    auth.submitInTransition(async () => {
      // callbackURL is where the verification link lands.
      const result = await authClient.signUp.email({
        email: auth.email,
        password: auth.password,
        name,
        callbackURL: '/account'
      });

      if (result.error) {
        auth.setError(result.error.message ?? auth.t(SIGN_UP_FAILED));
        return;
      }
      await auth.refreshSession();
    });

  return (
    <Page>
      <AuthForm
        promptCommand='useradd --join'
        hint={auth.t(SIGNUP_HINT)}
        hydrated={auth.hydrated}
        isPending={auth.isPending}
        setError={auth.setError}
        error={auth.error}
        errorCallbackURL='/signup'
        githubFailMessage={GITHUB_SIGN_UP_FAILED}
        submitLabel={auth.isPending ? auth.t(CREATING) : auth.t(CREATE_ACCOUNT)}
        onEmailSubmit={onEmailSubmit}
        fields={
          <>
            <AuthField id='name' type='text' label={NAME_LABEL} autoComplete='name' value={name} onChange={setName} />
            <EmailPasswordFields
              email={auth.email}
              setEmail={auth.setEmail}
              password={auth.password}
              setPassword={auth.setPassword}
              passwordAutoComplete='new-password'
            />
          </>
        }
      />
    </Page>
  );
}
