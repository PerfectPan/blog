import type { ReactNode } from 'react';

/** Pill toggle in a toolbar. `interactive` gives the comment toolbar its
 *  pointer cursor; the editor toolbar keeps the default. */
export function ModeButton({
  active,
  onClick,
  interactive = false,
  children
}: {
  active: boolean;
  onClick: () => void;
  interactive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`${interactive ? 'cursor-pointer ' : ''}rounded px-2 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary'
      }`}
    >
      {children}
    </button>
  );
}
