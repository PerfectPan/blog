/**
 * Global chrome: header title bar, footer status bar, home hero panel.
 *
 * Command-style labels (login / grep / rss / ...) are part of the terminal
 * design language and stay verbatim in both languages; screen-reader labels
 * and prose are localized. zh values must match the pre-i18n UI byte for
 * byte (regression red line).
 */
export interface ChromeMessages {
  /** Header tool labels — command style, same value in zh and en. */
  login: string;
  signup: string;
  logout: string;
  grep: string;
  github: string;
  rss: string;
  /** Screen-reader labels for the same tools. */
  logoutAria: string;
  searchAria: string;
  githubAria: string;
  rssAria: string;
  openToolsMenu: string;
  closeToolsMenu: string;
  /** Language switcher buttons carry each language's own name (never
   *  translated — the standard for language switchers). */
  langZhName: string;
  langEnName: string;
  /** Footer tmux-window nav group label. */
  siteWindowsAria: string;
  /** Home: recent-posts panel counter and empty state. */
  postsCount: (n: number) => string;
  noPosts: string;
  /** Header logout confirmation dialog. */
  logoutConfirmDescription: string;
}

export const chromeZh: ChromeMessages = {
  login: 'login',
  signup: 'signup',
  logout: 'logout',
  grep: 'grep',
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
  siteWindowsAria: '站点窗口',
  postsCount: (n) => `${n} 篇文章`,
  noPosts: '暂无文章',
  logoutConfirmDescription: '确定要退出登录吗？退出后需要重新登录。',
};

export const chromeEn: ChromeMessages = {
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
  siteWindowsAria: 'Site windows',
  postsCount: (n) => `${n} posts`,
  noPosts: 'no posts yet',
  logoutConfirmDescription: 'Log out? You will need to sign in again.',
};
