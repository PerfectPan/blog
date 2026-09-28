import { useLocale } from './context.js';

/**
 * All UI copy in one place. `zh` is the source of truth — its inferred shape
 * is the type (`Copy`) that `en` must mirror — and `useMessages()` returns the
 * active locale's tree. Sections are grouping only; add keys where they read
 * best, not to a fixed domain contract.
 *
 * Kept verbatim in BOTH locales on purpose:
 * - terminal output: `#` comment lines, ls / cd / whoami / FIGLET, reply / rm /
 *   tail -f, the grep prompt, pagination `← prev / next →`;
 * - account `id` status values (verified / not verified / set / not set /
 *   linked (id …) / not linked) — e2e-frozen literals;
 * - zh aria-labels on header tools (Search posts (Cmd+K), Open tools menu, …)
 *   — e2e-frozen selectors; en localizes them;
 * - brands and protocol names: github / rss.
 */

export const zh = {
  chrome: {
    login: '登录',
    signup: '注册',
    logout: '登出',
    grep: '搜索',
    github: 'github',
    rss: 'rss',
    logoutAria: 'Logout',
    searchAria: 'Search posts (Cmd+K)',
    githubAria: 'GitHub',
    rssAria: 'RSS',
    openToolsMenu: 'Open tools menu',
    closeToolsMenu: 'Close tools menu',
    langZhName: '中文',
    langEnName: 'English',
    switchLocale: (name: string) => `切换到${name}`,
    siteWindowsAria: '站点窗口',
    postsCount: (n: number) => `${n} 篇文章`,
    noPosts: '暂无文章',
    logoutConfirmDescription: '确定要退出登录吗？',
  },
  auth: {
    authErrors: {
      account_not_linked:
        '这个邮箱已经有账号但还没验证。先用邮箱密码登录，再到 account 页验证邮箱或绑定 GitHub。',
      account_already_linked_to_different_user:
        '这个 GitHub 账号已经绑定了另一个用户。',
      unable_to_link_account: 'GitHub 邮箱未验证，无法绑定。',
      invalid_token: '验证链接无效，请重新发送验证邮件。',
      token_expired: '验证链接已过期，请重新发送验证邮件。',
    },
    authErrorFallback: (code: string) => `GitHub 登录失败（${code}）`,
    checkingSession: '# 正在检查登录状态…',
    loginHint: '# 邮箱密码登录，或通过 GitHub 登录。',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    signIn: '登录',
    signingIn: '登录中…',
    continueWithGithub: '通过 GitHub 登录',
    signInFailed: '登录失败',
    githubSignInFailed: 'GitHub 登录失败',
    noAccountYet: '# 还没有账号？',
    signupLink: '注册',
    signupHint: '# 注册后成为会员，可阅读会员可见的文章。',
    nameLabel: '用户名',
    createAccount: '创建账号',
    creating: '创建中…',
    signUpFailed: '注册失败',
    githubSignUpFailed: 'GitHub 注册失败',
    unlockHint: '# 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。',
    unlockPasswordLabel: '文章密码',
    sudoUnlock: '解锁',
    backToPost: '← 返回文章',
    unlockErrorMissing: '请输入访问密码',
    unlockErrorInvalid: '密码错误，请重试',
    logoutTitle: '退出登录',
    loggingOut: '正在退出登录...',
    logoutSettled: '已退出或退出失败，请重试。',
    logoutFailed: '退出失败',
    logoutButtonPending: '正在退出...',
    logoutRetry: '重试退出',
  },
  blog: {
    prevPage: '← prev',
    nextPage: 'next →',
    pageInfo: (page: number, total: number) => `page ${page} / ${total}`,
    paginationAria: 'Pagination',
    devHintGuest: '当前身份：游客；可见范围：public',
    devHintAdmin: '当前身份：admin；可见范围：全部已发布（含 password）',
    devHintVip: '当前身份：vip；可见范围：public/member/vip',
    devHintMember: '当前身份：member；可见范围：public/member',
  },
  social: {
    justNow: '刚刚',
    minutesAgo: (n: number) => `${n} 分钟前`,
    hoursAgo: (n: number) => `${n} 小时前`,
    daysAgo: (n: number) => `${n} 天前`,
    charsLeft: (n: number) => `${n} 字剩余`,
    markdownHint: '支持 Markdown',
    newCommentPlaceholder: '写下你的评论…（支持 Markdown）',
    replyPlaceholder: (authorName: string) => `回复 @${authorName}…`,
    sending: '发送中…',
    commentFailed: '评论失败，请重试',
    deleteFailed: '删除失败，请重试',
    loadMoreFailed: '加载更多失败',
    loading: '加载中…',
    deleteCommentConfirm: '删除这条评论？',
    deleteReplyConfirm: '删除这条回复？',
    loginLink: '登录',
    loginHintSuffix: '后即可评论。',
    noComments: '还没有评论，来抢沙发。',
  },
  pages: {
    // e2e-frozen: the pre-i18n UI rendered these in English for every visitor.
    emailVerified: 'verified',
    emailNotVerified: 'not verified',
    passwordSet: 'set',
    passwordNotSet: 'not set',
    githubLinked: (accountId: string) => `linked (id ${accountId})`,
    githubNotLinked: 'not linked',
    verifyEmailHint:
      '验证邮箱后，用同一邮箱的 GitHub 登录会自动合并进这个账号。',
    verificationSent: (email: string) =>
      `验证邮件已发到 ${email}，1 小时内有效。`,
    sendVerificationFailed: '发送验证邮件失败',
    githubLinkedHint: '已绑定 GitHub，可以直接通过 GitHub 登录这个账号。',
    githubNotLinkedHint:
      '绑定后可以用 GitHub 登录这个账号，GitHub 邮箱不必和上面的一致。',
    linkGithubFailed: '绑定 GitHub 失败',
    unlinkGithubFailed: '解绑 GitHub 失败',
    unlinkConfirmDescription:
      '解绑后不能再用 GitHub 登录这个账号，邮箱密码登录不受影响。',
    loadAccountsFailed: '读取登录方式失败',
    loadAccountsFailedRetry: '读取登录方式失败，请重试',
  },
  misc: {
    notFoundComment: '# 你闯入了无人之境。',
    backToBlogList: '← 回到博客列表',
    requestFailed: (error: string) => `Request failed: ${error}`,
    switchModeAria: (next: string, current: string) =>
      `切换到${next}模式（当前：${current}）`,
    themeLabel: (pref: 'light' | 'dark' | 'system'): string =>
      pref === 'light' ? '浅色' : pref === 'dark' ? '深色' : '系统',
    copyAria: '复制代码',
    copyLabel: '复制',
    copiedLabel: '已复制',
    confirm: '确认',
    cancel: '取消',
    searchPlaceholder: "grep -ri '关键词' ~/posts",
    searchIdleHint: '# type to grep ~/posts',
    searchNoMatches: '# no matches found',
    searchHints: '↑↓ 选择 · ↵ 打开 · esc 关闭 · 结果按当前身份过滤',
  },
};

export type Copy = typeof zh;

export const en: Copy = {
  chrome: {
    login: 'login',
    signup: 'signup',
    logout: 'logout',
    grep: 'grep',
    github: 'github',
    rss: 'rss',
    logoutAria: 'Log out',
    searchAria: 'Search posts (Cmd+K)',
    githubAria: 'GitHub',
    rssAria: 'RSS',
    openToolsMenu: 'Open tools menu',
    closeToolsMenu: 'Close tools menu',
    langZhName: '中文',
    langEnName: 'English',
    switchLocale: (name) => `Switch to ${name}`,
    siteWindowsAria: 'Site windows',
    postsCount: (n) => `${n} posts`,
    noPosts: 'no posts yet',
    logoutConfirmDescription: 'Log out?',
  },
  auth: {
    authErrors: {
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
    authErrorFallback: (code) => `GitHub sign-in failed (${code})`,
    checkingSession: '# checking session…',
    loginHint: '# Sign in with email and password, or use GitHub.',
    emailLabel: 'email',
    passwordLabel: 'password',
    signIn: 'sign in',
    signingIn: 'signing in…',
    continueWithGithub: 'continue with github',
    signInFailed: 'Sign-in failed',
    githubSignInFailed: 'GitHub sign-in failed',
    noAccountYet: '# No account yet?',
    signupLink: 'signup',
    signupHint:
      '# Sign up to become a member and read member-visibility posts.',
    nameLabel: 'name',
    createAccount: 'create account',
    creating: 'creating…',
    signUpFailed: 'Sign-up failed',
    githubSignUpFailed: 'GitHub sign-up failed',
    unlockHint:
      '# This post is password-protected. Enter the post password once and read freely for 24 hours.',
    unlockPasswordLabel: 'password for this post',
    sudoUnlock: 'sudo unlock',
    backToPost: '← back to post',
    unlockErrorMissing: 'Enter the access password',
    unlockErrorInvalid: 'Wrong password, try again',
    logoutTitle: 'Log out',
    loggingOut: 'Logging out...',
    logoutSettled: 'Signed out, or the sign-out failed. Please try again.',
    logoutFailed: 'Logout failed',
    logoutButtonPending: 'Logging out...',
    logoutRetry: 'Retry Logout',
  },
  blog: {
    prevPage: '← prev',
    nextPage: 'next →',
    pageInfo: (page, total) => `page ${page} / ${total}`,
    paginationAria: 'Pagination',
    devHintGuest: 'Current identity: guest; visible scope: public',
    devHintAdmin:
      'Current identity: admin; visible scope: all published (including password)',
    devHintVip: 'Current identity: vip; visible scope: public/member/vip',
    devHintMember: 'Current identity: member; visible scope: public/member',
  },
  social: {
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
    loginLink: 'login',
    loginHintSuffix: ' to comment.',
    noComments: 'no comments yet — be the first.',
  },
  pages: {
    emailVerified: 'verified',
    emailNotVerified: 'not verified',
    passwordSet: 'set',
    passwordNotSet: 'not set',
    githubLinked: (accountId) => `linked (id ${accountId})`,
    githubNotLinked: 'not linked',
    verifyEmailHint:
      'Verify your email and a GitHub sign-in with the same address will merge into this account automatically.',
    verificationSent: (email) =>
      `Verification email sent to ${email}, valid for 1 hour.`,
    sendVerificationFailed: 'Failed to send the verification email.',
    githubLinkedHint:
      'GitHub is linked — continue with github now signs you in to this account.',
    githubNotLinkedHint:
      'Link GitHub to sign in to this account with it; the GitHub email does not have to match the one above.',
    linkGithubFailed: 'Failed to link GitHub.',
    unlinkGithubFailed: 'Failed to unlink GitHub.',
    unlinkConfirmDescription:
      'Once unlinked, you can no longer sign in to this account with GitHub. Email + password sign-in is unaffected.',
    loadAccountsFailed: 'Failed to load sign-in methods.',
    loadAccountsFailedRetry: 'Failed to load sign-in methods. Please retry.',
  },
  misc: {
    notFoundComment: '# you have wandered into uncharted territory.',
    backToBlogList: '← back to the blog list',
    requestFailed: (error) => `Request failed: ${error}`,
    switchModeAria: (next, current) =>
      `Switch to ${next} mode (current: ${current})`,
    themeLabel: (pref) => pref,
    copyAria: 'Copy code',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    confirm: 'confirm',
    cancel: 'cancel',
    searchPlaceholder: "grep -ri 'pattern' ~/posts",
    searchIdleHint: '# type to grep ~/posts',
    searchNoMatches: '# no matches found',
    searchHints:
      '↑↓ select · ↵ open · esc close · results filtered by your current role',
  },
};

/** The active locale's copy tree; without a provider (admin) it is zh. */
export function useMessages(): Copy {
  const { locale } = useLocale();
  return locale === 'en' ? en : zh;
}

/**
 * Better Auth reports OAuth and email-verification failures as
 * `?error=<code>` on the callback URL; the copy for the codes a user can
 * cause lives in `auth.authErrors`. The zh default keeps the function usable
 * without an active locale bundle.
 */
export function authErrorMessage(
  code: string,
  messages: Copy['auth'] = zh.auth,
): string {
  const errors = messages.authErrors as Record<string, string>;
  return errors[code] ?? messages.authErrorFallback(code);
}
