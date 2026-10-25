import { Suspense, useEffect, useState, type ReactNode } from 'react';

/** Keeps the lazy ConfirmDialog mounted after its first opening so radix can
 *  animate the close; renders nothing before that. */
export function ConfirmDialogGate({ open, children }: { open: boolean; children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (open) {
      setArmed(true);
    }
  }, [open]);
  return armed ? <Suspense fallback={null}>{children}</Suspense> : null;
}
