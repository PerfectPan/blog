import { type Msg } from '../../lib/i18n/messages.js';
import { useT } from '../../lib/i18n/context.js';

const FIELD_CLASSES =
  'w-full rounded-lg border border-border bg-secondary px-2.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_15%,transparent)]';

/** One labelled text input of the auth forms: the label with its `▸` prompt and the shared field styling. */
export function AuthField(props: {
  id: string;
  type: 'email' | 'password' | 'text';
  label: Msg;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useT();
  return (
    <div className='my-3.5 max-w-105 [&_label]:mb-1.25 [&_label]:block [&_label]:text-xs [&_label]:text-muted-foreground'>
      <label htmlFor={props.id}>
        <span className='text-primary'>▸ </span>
        {t(props.label)}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type}
        required
        autoComplete={props.autoComplete}
        className={FIELD_CLASSES}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}
