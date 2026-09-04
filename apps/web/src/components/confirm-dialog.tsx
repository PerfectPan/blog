import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prompt line shown as the title, e.g. "logout" or "rm comment". */
  command: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
};

/**
 * Shared confirmation dialog on the shadcn Dialog primitives, skinned with
 * `.th-confirm` (same approach as the cmd+k palette's `.th-pal`). Replaces
 * native window.confirm so confirms match the rest of the UI.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  command,
  description,
  confirmLabel = 'confirm',
  cancelLabel = 'cancel',
  pending,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='th-confirm'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 font-normal'>
            <span className='th-confirm-prompt'>~ %</span>
            <span>{command}</span>
          </DialogTitle>
          <DialogDescription className='th-confirm-desc'>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-2'>
          <button
            type='button'
            className='th-btn'
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </button>
          <button
            type='button'
            className='th-btn th-btn-primary'
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
