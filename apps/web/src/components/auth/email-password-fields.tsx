import { EMAIL_LABEL, PASSWORD_LABEL } from '../../lib/i18n/messages.js';
import { useT } from '../../lib/i18n/context.js';
import { AuthField } from './auth-field';

/** The email and password pair both auth forms open with; the password's autocomplete differs per form. */
export function EmailPasswordFields(props: {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  passwordAutoComplete: string;
}) {
  const t = useT();
  void t;
  return (
    <>
      <AuthField
        id='email'
        type='email'
        label={EMAIL_LABEL}
        autoComplete='email'
        value={props.email}
        onChange={props.setEmail}
      />
      <AuthField
        id='password'
        type='password'
        label={PASSWORD_LABEL}
        autoComplete={props.passwordAutoComplete}
        value={props.password}
        onChange={props.setPassword}
      />
    </>
  );
}
