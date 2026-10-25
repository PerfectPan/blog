import type { ReactNode } from 'react';

/** Square toolbar button. `interactive` gives the comment toolbar its pointer
 *  cursor; the editor toolbar keeps the default. */
export function ToolButton({
  label,
  onClick,
  interactive = false,
  children
}: {
  label: string;
  onClick: () => void;
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:text-primary ${interactive ? 'cursor-pointer' : ''}`}
    >
      {children}
    </button>
  );
}
