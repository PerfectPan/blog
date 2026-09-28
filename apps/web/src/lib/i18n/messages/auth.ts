/**
 * Auth flow strings: login / signup forms, the password-unlock page, the
 * logout page, and the Better Auth error codes reported as `?error=<code>`
 * on the callback URL.
 *
 * Functional form copy is localized; only the en bundle keeps the SSH-session
 * flavor (sign in, continue with github, sudo unlock, …). `#`-prefixed hint
 * lines stay shell comments in both locales.
 */
export interface AuthMessages {
  /** Better Auth error-code → copy, for the codes a user can cause. */
  authErrors: Record<string, string>;
  /** Fallback for unmapped error codes. */
  authErrorFallback: (code: string) => string;
  /** Shared session-check line on /login and /signup. */
  checkingSession: string;
  /** Login form. */
  loginHint: string;
  emailLabel: string;
  passwordLabel: string;
  signIn: string;
  signingIn: string;
  continueWithGithub: string;
  signInFailed: string;
  githubSignInFailed: string;
  noAccountYet: string;
  signupLink: string;
  /** Signup form. */
  signupHint: string;
  nameLabel: string;
  createAccount: string;
  creating: string;
  signUpFailed: string;
  githubSignUpFailed: string;
  /** Per-post password unlock (/unlock/:slug). */
  unlockHint: string;
  unlockPasswordLabel: string;
  sudoUnlock: string;
  backToPost: string;
  unlockErrorMissing: string;
  unlockErrorInvalid: string;
  /** Standalone logout page (/logout). */
  logoutTitle: string;
  loggingOut: string;
  logoutSettled: string;
  logoutFailed: string;
  logoutButtonPending: string;
  logoutRetry: string;
}

export const authZh: AuthMessages = {
  authErrors: {
    account_not_linked:
      '这个邮箱已经有账号但还没验证。先用邮箱密码登录，再到 account 页验证邮箱或绑定 GitHub。',
    account_already_linked_to_different_user:
      '这个 GitHub 账号已经绑定了另一个用户。',
    unable_to_link_account: 'GitHub 邮箱未验证，无法绑定。',
    invalid_token: '验证链接无效，请重新发送验证邮件。',
    token_expired: '验证链接已过期，请重新发送验证邮件。',
  },
  authErrorFallback: (code) => `GitHub 登录失败（${code}）`,
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
  signupHint: '# 注册成为 member，可读 member 可见性的文章。',
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
};

export const authEn: AuthMessages = {
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
  loginHint: '# Sign in with email and password, or use GitHub OAuth.',
  emailLabel: 'email',
  passwordLabel: 'password',
  signIn: 'sign in',
  signingIn: 'signing in…',
  continueWithGithub: 'continue with github',
  signInFailed: 'Sign-in failed',
  githubSignInFailed: 'GitHub sign-in failed',
  noAccountYet: '# No account yet?',
  signupLink: 'signup',
  signupHint: '# Sign up to become a member and read member-visibility posts.',
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
};
