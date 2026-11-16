/** The validation error both auth forms show under their actions. */
export function AuthError({ error }: { error: string | null }) {
  if (!error) {
    return null;
  }
  return (
    <p role='alert' className='my-2.5 text-sm text-destructive'>
      {error}
    </p>
  );
}
