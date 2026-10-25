import type { CommentThread, SessionUser } from '@blog/shared';
import { useT } from '../../lib/i18n/context.js';
import {
  DELETE_COMMENT_CONFIRM,
  DELETE_REPLY_CONFIRM,
  REPLY_ACTION,
  REPLY_PLACEHOLDER
} from '../../lib/i18n/messages.js';
import { Composer } from './comment-composer';
import { CommentView } from './comment-view';

type CommentItemProps = {
  thread: CommentThread;
  sessionUser: SessionUser | null;
  onReply: (parentId: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replySubmitting: Set<string>;
};

export function CommentItem({
  thread,
  sessionUser,
  onReply,
  onDelete,
  replyingTo,
  setReplyingTo,
  replySubmitting
}: CommentItemProps) {
  const t = useT();
  const canAct = sessionUser != null && (thread.isOwn || sessionUser.role === 'admin');
  const showReplyBox = sessionUser != null && replyingTo === thread.id;

  async function handleDelete() {
    if (!canAct) {
      return;
    }
    if (!window.confirm(t(DELETE_COMMENT_CONFIRM))) {
      return;
    }
    // onDelete (the parent handleDelete) catches its own errors and surfaces
    // them via topError, so it does not throw — no swallow, no unhandled reject.
    await onDelete(thread.id);
  }

  return (
    <li className='flex flex-col gap-2'>
      <CommentView
        comment={thread}
        canAct={canAct}
        canReply={sessionUser != null}
        onReply={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
        onDelete={handleDelete}
      />

      {/* Replies and the open reply box hang off one continuous thread line
          (no background slab — the cards themselves carry the chrome). */}
      {showReplyBox || thread.replies.length > 0 ? (
        <div className='ml-10 flex flex-col gap-3 border-l border-border pl-3.5'>
          {showReplyBox ? (
            <Composer
              placeholder={t(REPLY_PLACEHOLDER, { name: thread.author.name })}
              submitLabel={t(REPLY_ACTION)}
              submitting={replySubmitting.has(thread.id)}
              onSubmit={(body: string) => onReply(thread.id, body)}
              compact
            />
          ) : null}
          {thread.replies.map((reply) => {
            const replyCanAct = sessionUser != null && (reply.isOwn || sessionUser.role === 'admin');
            return (
              <CommentView
                key={reply.id}
                comment={reply}
                canAct={replyCanAct}
                canReply={false}
                onReply={undefined}
                onDelete={async () => {
                  if (!window.confirm(t(DELETE_REPLY_CONFIRM))) {
                    return;
                  }
                  await onDelete(reply.id);
                }}
              />
            );
          })}
        </div>
      ) : null}
    </li>
  );
}
