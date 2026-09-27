/**
 * Comments strings. Command-style labels (reply / rm / tail -f / AUTHOR, the
 * `comments --on <slug>` prompt) are part of the terminal design language and
 * stay verbatim in both languages. zh values must match the pre-i18n UI byte
 * for byte (regression red line).
 */
export interface SocialMessages {
  /** Relative timestamps (<30 days); older falls back to formatDate. */
  justNow: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  daysAgo: (n: number) => string;
  /** Composer: char counter, Markdown hint, placeholders, pending state. */
  charsLeft: (n: number) => string;
  markdownHint: string;
  newCommentPlaceholder: string;
  replyPlaceholder: (authorName: string) => string;
  sending: string;
  /** Failure fallbacks shown when a server fn throws a non-Error. */
  commentFailed: string;
  deleteFailed: string;
  loadMoreFailed: string;
  /** Pending label on the `tail -f` load-more button. */
  loading: string;
  /** window.confirm texts and the empty state. */
  deleteCommentConfirm: string;
  deleteReplyConfirm: string;
  /** Trailing part of "# login <suffix>" — the link text is the `login` command. */
  loginHintSuffix: string;
  noComments: string;
}

export const socialZh: SocialMessages = {
  justNow: '刚刚',
  minutesAgo: (n) => `${n} 分钟前`,
  hoursAgo: (n) => `${n} 小时前`,
  daysAgo: (n) => `${n} 天前`,
  charsLeft: (n) => `${n} 字剩余`,
  markdownHint: '支持 Markdown',
  newCommentPlaceholder: '写下你的评论…（支持 Markdown）',
  replyPlaceholder: (authorName) => `回复 @${authorName}…`,
  sending: '发送中…',
  commentFailed: '评论失败，请重试',
  deleteFailed: '删除失败，请重试',
  loadMoreFailed: '加载更多失败',
  loading: '加载中…',
  deleteCommentConfirm: '删除这条评论？',
  deleteReplyConfirm: '删除这条回复？',
  loginHintSuffix: '后即可评论。',
  noComments: '还没有评论，来抢沙发。',
};

export const socialEn: SocialMessages = {
  justNow: 'just now',
  minutesAgo: (n) => (n === 1 ? '1 minute ago' : `${n} minutes ago`),
  hoursAgo: (n) => (n === 1 ? '1 hour ago' : `${n} hours ago`),
  daysAgo: (n) => (n === 1 ? '1 day ago' : `${n} days ago`),
  charsLeft: (n) => `${n} characters left`,
  markdownHint: 'Markdown supported',
  newCommentPlaceholder: 'Write a comment… (Markdown supported)',
  replyPlaceholder: (authorName) => `Reply to @${authorName}…`,
  sending: 'Sending…',
  commentFailed: 'Failed to post the comment. Please try again.',
  deleteFailed: 'Failed to delete the comment. Please try again.',
  loadMoreFailed: 'Failed to load more comments.',
  loading: 'Loading…',
  deleteCommentConfirm: 'Delete this comment?',
  deleteReplyConfirm: 'Delete this reply?',
  loginHintSuffix: 'to comment.',
  noComments: 'no comments yet — be the first.',
};
