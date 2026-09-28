/**
 * Standalone page strings. Currently the account page (email verification,
 * GitHub link / unlink). The projects and about pages render their copy from
 * `lib/projects.ts` (per-project bilingual descriptions) and the markdown
 * constants in `routes/about.tsx`. Command-style labels (the `id` prompt,
 * the email / role / password / github keys, send verification email /
 * link github / unlink github / retry, `# checking session…`) are terminal
 * design language and stay verbatim in both languages.
 *
 * zh values must match the pre-i18n UI byte for byte (regression red line),
 * including the `id` panel status values (verified / not verified / set /
 * not set / linked / not linked): the pre-i18n UI rendered them in English
 * for every visitor, so both locales keep those exact literals.
 */
export interface PagesMessages {
  /** `id` panel status values. */
  emailVerified: string;
  emailNotVerified: string;
  passwordSet: string;
  passwordNotSet: string;
  githubLinked: (accountId: string) => string;
  githubNotLinked: string;
  /** Email verification. */
  verifyEmailHint: string;
  verificationSent: (email: string) => string;
  sendVerificationFailed: string;
  /** GitHub link / unlink hints and failure fallbacks. */
  githubLinkedHint: string;
  githubNotLinkedHint: string;
  linkGithubFailed: string;
  unlinkGithubFailed: string;
  unlinkConfirmDescription: string;
  /** Sign-in method list loading. */
  loadAccountsFailed: string;
  loadAccountsFailedRetry: string;
}

export const pagesZh: PagesMessages = {
  emailVerified: 'verified',
  emailNotVerified: 'not verified',
  passwordSet: 'set',
  passwordNotSet: 'not set',
  githubLinked: (accountId) => `linked (id ${accountId})`,
  githubNotLinked: 'not linked',
  verifyEmailHint: '验证邮箱后，用同一邮箱的 GitHub 登录会自动合并进这个账号。',
  verificationSent: (email) => `验证邮件已发到 ${email}，1 小时内有效。`,
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
};

export const pagesEn: PagesMessages = {
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
};
