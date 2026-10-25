import type { Comment } from '@blog/shared';
import { useT, type TFn } from '../../lib/i18n/context.js';
import { DAYS_AGO, DELETE_ACTION, HOURS_AGO, JUST_NOW, MINUTES_AGO, REPLY_ACTION } from '../../lib/i18n/messages.js';
import { CommentBody } from './comment-body';

/** Shared class of the per-comment action row (reply / delete). */
const ACTION_ROW =
  'flex gap-3.5 px-3.5 pb-2.5 text-xs [&_button]:cursor-pointer [&_button]:bg-none [&_button]:text-muted-foreground [&_button:hover]:text-primary';

function formatRelative(iso: string, t: TFn): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) {
    return t(JUST_NOW);
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t(MINUTES_AGO, { n: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t(HOURS_AGO, { n: hours });
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return t(DAYS_AGO, { n: days });
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

type CommentViewProps = {
  comment: Comment;
  canAct: boolean;
  canReply?: boolean;
  onReply?: () => void;
  onDelete: () => void | Promise<void>;
};

export function CommentView({ comment, canAct, canReply, onReply, onDelete }: CommentViewProps) {
  const t = useT();
  return (
    <div className='my-3 overflow-hidden rounded-lg border border-border'>
      <div className='flex items-center gap-2.5 border-b border-border bg-secondary px-3.5 py-2 text-xs text-muted-foreground'>
        <span className='text-foreground'>{comment.author.name}</span>
        {comment.author.role === 'admin' ? (
          <span className='rounded-full bg-primary px-1.75 py-px text-xs font-bold leading-normal text-primary-foreground'>
            AUTHOR
          </span>
        ) : null}
        {comment.status !== 'visible' ? (
          <span className='rounded-sm border border-current px-1.5 text-xs font-bold leading-relaxed tracking-wide text-muted-foreground'>
            {comment.status}
          </span>
        ) : null}
        <span>{formatRelative(comment.createdAt, t)}</span>
      </div>
      <div className='px-3.5 py-2.5'>
        <CommentBody html={comment.bodyHtml ?? ''} />
      </div>
      {canReply && onReply ? (
        <div className={ACTION_ROW}>
          <button type='button' onClick={onReply}>
            {t(REPLY_ACTION)}
          </button>
          {canAct ? (
            <button type='button' className='hover:text-destructive!' onClick={() => onDelete()}>
              {t(DELETE_ACTION)}
            </button>
          ) : null}
        </div>
      ) : canAct ? (
        <div className={ACTION_ROW}>
          <button type='button' className='hover:text-destructive!' onClick={() => onDelete()}>
            {t(DELETE_ACTION)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
