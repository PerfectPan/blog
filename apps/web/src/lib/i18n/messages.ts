import type { Locale } from '@blog/shared';
import { IntlMessageFormat } from 'intl-messageformat';

/**
 * All UI copy, one export per string, each entry carrying both locales so a
 * bundle includes exactly the entries its call sites reference (tree-shaking
 * works per entry). Resolve with `t(entry)` from `useT()`; parameterized
 * entries use standard ICU MessageFormat patterns (`icu` factory) and take a
 * named-args object through `t`: `t(postsCount, { count: 5 })`.
 *
 * Kept verbatim in BOTH locales on purpose:
 * - terminal output: `#` comment lines, ls / cd / whoami / FIGLET, reply / rm /
 *   tail -f, the grep prompt, pagination `← prev / next →`;
 * - account `id` status values (verified / not verified / …) — e2e-frozen;
 * - zh aria-labels on header tools (Search posts (Cmd+K), …) — e2e-frozen
 *   selectors; en localizes them;
 * - brands and protocol names: github / rss.
 */

export type Msg = { zh: string; en: string };

/** ICU-pattern entry; `icu` keeps the arg names in the type so call sites
 *  passing wrong (or missing) keys fail to compile. */
export type IcuMsg<A extends Record<string, string | number>> = Msg & {
  readonly __args?: A;
};

export const icu = <A extends Record<string, string | number>>(
  zh: string,
  en: string,
): IcuMsg<A> => ({ zh, en });

const formatCache = new Map<string, IntlMessageFormat>();
const LOCALE_TAGS: Record<Locale, string> = { zh: 'zh-CN', en: 'en' };

/** Resolve an entry in `locale`; patterns are compiled once and cached. */
export function formatMsg(
  locale: Locale,
  entry: Msg,
  args?: Record<string, string | number>,
): string {
  const pattern = entry[locale];
  if (!pattern.includes('{')) {
    return pattern;
  }
  const key = `${locale}::${pattern}`;
  let fmt = formatCache.get(key);
  if (fmt === undefined) {
    fmt = new IntlMessageFormat(pattern, LOCALE_TAGS[locale]);
    formatCache.set(key, fmt);
  }
  return fmt.format(args ?? {}).toString();
}

// ── header / footer / home ─────────────────────────────────────────────────

export const navLogin: Msg = { zh: '登录', en: 'login' };
export const navSignup: Msg = { zh: '注册', en: 'signup' };
export const navLogout: Msg = { zh: '登出', en: 'logout' };
export const searchTool: Msg = { zh: '搜索', en: 'grep' };
export const githubLabel: Msg = { zh: 'github', en: 'github' };
export const rssLabel: Msg = { zh: 'rss', en: 'rss' };
export const logoutAria: Msg = { zh: 'Logout', en: 'Log out' };
export const searchAria: Msg = {
  zh: 'Search posts (Cmd+K)',
  en: 'Search posts (Cmd+K)',
};
export const githubAria: Msg = { zh: 'GitHub', en: 'GitHub' };
export const rssAria: Msg = { zh: 'RSS', en: 'RSS' };
export const openToolsMenu: Msg = {
  zh: 'Open tools menu',
  en: 'Open tools menu',
};
export const closeToolsMenu: Msg = {
  zh: 'Close tools menu',
  en: 'Close tools menu',
};
export const langZhName: Msg = { zh: '中文', en: '中文' };
export const langEnName: Msg = { zh: 'English', en: 'English' };
export const switchLocale = icu<{ name: string }>(
  '切换到{name}',
  'Switch to {name}',
);
export const siteWindowsAria: Msg = { zh: '站点窗口', en: 'Site windows' };
export const postsCount = icu<{ count: number }>(
  '{count} 篇文章',
  '{count, plural, one {# post} other {# posts}}',
);
export const noPosts: Msg = { zh: '暂无文章', en: 'no posts yet' };
export const logoutConfirmDescription: Msg = {
  zh: '确定要退出登录吗？',
  en: 'Log out?',
};

// ── login / signup / unlock / logout ───────────────────────────────────────

export const checkingSession: Msg = {
  zh: '# 正在检查登录状态…',
  en: '# checking session…',
};
export const loginHint: Msg = {
  zh: '# 邮箱密码登录，或通过 GitHub 登录。',
  en: '# Sign in with email and password, or use GitHub.',
};
export const emailLabel: Msg = { zh: '邮箱', en: 'email' };
export const passwordLabel: Msg = { zh: '密码', en: 'password' };
export const signIn: Msg = { zh: '登录', en: 'sign in' };
export const signingIn: Msg = { zh: '登录中…', en: 'signing in…' };
export const continueWithGithub: Msg = {
  zh: '通过 GitHub 登录',
  en: 'continue with github',
};
export const signInFailed: Msg = { zh: '登录失败', en: 'Sign-in failed' };
export const githubSignInFailed: Msg = {
  zh: 'GitHub 登录失败',
  en: 'GitHub sign-in failed',
};
export const noAccountYet: Msg = {
  zh: '# 还没有账号？',
  en: '# No account yet?',
};
export const signupLink: Msg = { zh: '注册', en: 'signup' };
export const signupHint: Msg = {
  zh: '# 注册后成为会员，可阅读会员可见的文章。',
  en: '# Sign up to become a member and read member-visibility posts.',
};
export const nameLabel: Msg = { zh: '用户名', en: 'name' };
export const createAccount: Msg = { zh: '创建账号', en: 'create account' };
export const creating: Msg = { zh: '创建中…', en: 'creating…' };
export const signUpFailed: Msg = { zh: '注册失败', en: 'Sign-up failed' };
export const githubSignUpFailed: Msg = {
  zh: 'GitHub 注册失败',
  en: 'GitHub sign-up failed',
};
export const unlockHint: Msg = {
  zh: '# 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。',
  en: '# This post is password-protected. Enter the post password once and read freely for 24 hours.',
};
export const unlockPasswordLabel: Msg = {
  zh: '文章密码',
  en: 'password for this post',
};
export const sudoUnlock: Msg = { zh: '解锁', en: 'sudo unlock' };
export const backToPost: Msg = { zh: '← 返回文章', en: '← back to post' };
export const unlockErrorMissing: Msg = {
  zh: '请输入访问密码',
  en: 'Enter the access password',
};
export const unlockErrorInvalid: Msg = {
  zh: '密码错误，请重试',
  en: 'Wrong password, try again',
};
export const logoutTitle: Msg = { zh: '退出登录', en: 'Log out' };
export const loggingOut: Msg = {
  zh: '正在退出登录...',
  en: 'Logging out...',
};
export const logoutSettled: Msg = {
  zh: '已退出或退出失败，请重试。',
  en: 'Signed out, or the sign-out failed. Please try again.',
};
export const logoutFailed: Msg = { zh: '退出失败', en: 'Logout failed' };
export const logoutButtonPending: Msg = {
  zh: '正在退出...',
  en: 'Logging out...',
};
export const logoutRetry: Msg = { zh: '重试退出', en: 'Retry Logout' };

// ── blog list ──────────────────────────────────────────────────────────────

export const prevPage: Msg = { zh: '← prev', en: '← prev' };
export const nextPage: Msg = { zh: 'next →', en: 'next →' };
export const pageInfo = icu<{ page: number; total: number }>(
  'page {page} / {total}',
  'page {page} / {total}',
);
export const paginationAria: Msg = { zh: 'Pagination', en: 'Pagination' };
// Dev-only scope hints (visible with `pnpm dev`); roles and visibility levels
// are data literals and stay untranslated.
export const devHintGuest: Msg = {
  zh: '当前身份：游客；可见范围：public',
  en: 'Current identity: guest; visible scope: public',
};
export const devHintAdmin: Msg = {
  zh: '当前身份：admin；可见范围：全部已发布（含 password）',
  en: 'Current identity: admin; visible scope: all published (including password)',
};
export const devHintVip: Msg = {
  zh: '当前身份：vip；可见范围：public/member/vip',
  en: 'Current identity: vip; visible scope: public/member/vip',
};
export const devHintMember: Msg = {
  zh: '当前身份：member；可见范围：public/member',
  en: 'Current identity: member; visible scope: public/member',
};

// ── comments ───────────────────────────────────────────────────────────────

export const justNow: Msg = { zh: '刚刚', en: 'just now' };
export const minutesAgo = icu<{ n: number }>(
  '{n} 分钟前',
  '{n, plural, one {# minute ago} other {# minutes ago}}',
);
export const hoursAgo = icu<{ n: number }>(
  '{n} 小时前',
  '{n, plural, one {# hour ago} other {# hours ago}}',
);
export const daysAgo = icu<{ n: number }>(
  '{n} 天前',
  '{n, plural, one {# day ago} other {# days ago}}',
);
export const charsLeft = icu<{ n: number }>(
  '{n} 字剩余',
  '{n, plural, one {# character left} other {# characters left}}',
);
export const markdownHint: Msg = {
  zh: '支持 Markdown',
  en: 'Markdown supported',
};
export const newCommentPlaceholder: Msg = {
  zh: '写下你的评论…（支持 Markdown）',
  en: 'Write a comment… (Markdown supported)',
};
export const replyPlaceholder = icu<{ name: string }>(
  '回复 @{name}…',
  'Reply to @{name}…',
);
export const sending: Msg = { zh: '发送中…', en: 'Sending…' };
export const commentFailed: Msg = {
  zh: '评论失败，请重试',
  en: 'Failed to post the comment. Please try again.',
};
export const deleteFailed: Msg = {
  zh: '删除失败，请重试',
  en: 'Failed to delete the comment. Please try again.',
};
export const loadMoreFailed: Msg = {
  zh: '加载更多失败',
  en: 'Failed to load more comments.',
};
export const loading: Msg = { zh: '加载中…', en: 'Loading…' };
export const deleteCommentConfirm: Msg = {
  zh: '删除这条评论？',
  en: 'Delete this comment?',
};
export const deleteReplyConfirm: Msg = {
  zh: '删除这条回复？',
  en: 'Delete this reply?',
};
export const loginLink: Msg = { zh: '登录', en: 'login' };
export const loginHintSuffix: Msg = { zh: '后即可评论。', en: ' to comment.' };
export const noComments: Msg = {
  zh: '还没有评论，来抢沙发。',
  en: 'no comments yet — be the first.',
};

// ── account ────────────────────────────────────────────────────────────────

// e2e-frozen: the pre-i18n UI rendered these in English for every visitor.
export const emailVerified: Msg = { zh: 'verified', en: 'verified' };
export const emailNotVerified: Msg = {
  zh: 'not verified',
  en: 'not verified',
};
export const passwordSet: Msg = { zh: 'set', en: 'set' };
export const passwordNotSet: Msg = { zh: 'not set', en: 'not set' };
export const githubLinked = icu<{ accountId: string }>(
  'linked (id {accountId})',
  'linked (id {accountId})',
);
export const githubNotLinked: Msg = { zh: 'not linked', en: 'not linked' };
export const verifyEmailHint: Msg = {
  zh: '验证邮箱后，用同一邮箱的 GitHub 登录会自动合并进这个账号。',
  en: 'Verify your email and a GitHub sign-in with the same address will merge into this account automatically.',
};
export const verificationSent = icu<{ email: string }>(
  '验证邮件已发到 {email}，1 小时内有效。',
  'Verification email sent to {email}, valid for 1 hour.',
);
export const sendVerificationFailed: Msg = {
  zh: '发送验证邮件失败',
  en: 'Failed to send the verification email.',
};
export const githubLinkedHint: Msg = {
  zh: '已绑定 GitHub，可以直接通过 GitHub 登录这个账号。',
  en: 'GitHub is linked — continue with github now signs you in to this account.',
};
export const githubNotLinkedHint: Msg = {
  zh: '绑定后可以用 GitHub 登录这个账号，GitHub 邮箱不必和上面的一致。',
  en: 'Link GitHub to sign in to this account with it; the GitHub email does not have to match the one above.',
};
export const linkGithubFailed: Msg = {
  zh: '绑定 GitHub 失败',
  en: 'Failed to link GitHub.',
};
export const unlinkGithubFailed: Msg = {
  zh: '解绑 GitHub 失败',
  en: 'Failed to unlink GitHub.',
};
export const unlinkConfirmDescription: Msg = {
  zh: '解绑后不能再用 GitHub 登录这个账号，邮箱密码登录不受影响。',
  en: 'Once unlinked, you can no longer sign in to this account with GitHub. Email + password sign-in is unaffected.',
};
export const loadAccountsFailed: Msg = {
  zh: '读取登录方式失败',
  en: 'Failed to load sign-in methods.',
};
export const loadAccountsFailedRetry: Msg = {
  zh: '读取登录方式失败，请重试',
  en: 'Failed to load sign-in methods. Please retry.',
};

// ── misc: 404 / errors / code copy / dialogs / theme / search ──────────────

export const notFoundComment: Msg = {
  zh: '# 你闯入了无人之境。',
  en: '# you have wandered into uncharted territory.',
};
export const backToBlogList: Msg = {
  zh: '← 回到博客列表',
  en: '← back to the blog list',
};
export const requestFailed = icu<{ error: string }>(
  'Request failed: {error}',
  'Request failed: {error}',
);
export const switchModeAria = icu<{ next: string; current: string }>(
  '切换到{next}模式（当前：{current}）',
  'Switch to {next} mode (current: {current})',
);
export const themeLabel = icu<{ pref: string }>(
  '{pref, select, light {浅色} dark {深色} system {系统} other {{pref}}}',
  '{pref}',
);
export const copyAria: Msg = { zh: '复制代码', en: 'Copy code' };
export const copyLabel: Msg = { zh: '复制', en: 'Copy' };
export const copiedLabel: Msg = { zh: '已复制', en: 'Copied' };
export const confirmDefault: Msg = { zh: '确认', en: 'confirm' };
export const cancelDefault: Msg = { zh: '取消', en: 'cancel' };
export const searchPlaceholder: Msg = {
  zh: "grep -ri '关键词' ~/posts",
  en: "grep -ri 'pattern' ~/posts",
};
export const searchIdleHint: Msg = {
  zh: '# type to grep ~/posts',
  en: '# type to grep ~/posts',
};
export const searchNoMatches: Msg = {
  zh: '# no matches found',
  en: '# no matches found',
};
export const searchHints: Msg = {
  zh: '↑↓ 选择 · ↵ 打开 · esc 关闭 · 结果按当前身份过滤',
  en: '↑↓ select · ↵ open · esc close · results filtered by your current role',
};

// ── Better Auth error codes (`?error=<code>` on the callback URL) ──────────

const authErrorCodes: Record<Locale, Record<string, string>> = {
  zh: {
    account_not_linked:
      '这个邮箱已经有账号但还没验证。先用邮箱密码登录，再到 account 页验证邮箱或绑定 GitHub。',
    account_already_linked_to_different_user:
      '这个 GitHub 账号已经绑定了另一个用户。',
    unable_to_link_account: 'GitHub 邮箱未验证，无法绑定。',
    invalid_token: '验证链接无效，请重新发送验证邮件。',
    token_expired: '验证链接已过期，请重新发送验证邮件。',
  },
  en: {
    account_not_linked:
      'This email already has an account, but it is not verified yet. Sign in with email and password first, then verify your email or link GitHub on the account page.',
    account_already_linked_to_different_user:
      'This GitHub account is already linked to another user.',
    unable_to_link_account: 'GitHub email is not verified — cannot link.',
    invalid_token:
      'This verification link is invalid. Please send a new verification email.',
    token_expired:
      'This verification link has expired. Please send a new verification email.',
  },
};

const authErrorFallback: Msg = {
  zh: 'GitHub 登录失败（{code}）',
  en: 'GitHub sign-in failed ({code})',
};

/** Copy for a Better Auth `?error=<code>` in the active locale. */
export function authErrorMessage(locale: Locale, code: string): string {
  return (
    authErrorCodes[locale][code] ??
    formatMsg(locale, authErrorFallback, { code })
  );
}
