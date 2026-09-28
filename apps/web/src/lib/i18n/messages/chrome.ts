/**
 * Global chrome: header title bar, footer status bar, home hero panel.
 *
 * Command-style labels (github / rss) are part of the terminal design
 * language and stay verbatim in both languages; auth nav actions (login /
 * signup / logout) and the search verb are localized. zh screen-reader
 * labels keep the master English values (frozen e2e selectors); en
 * localizes them.
 */
export interface ChromeMessages {
  /** Header auth and search tool labels (github / rss stay command-style). */
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
  /** Language names (never translated — the standard for language switchers). */
  langZhName: string;
  langEnName: string;
  /** Switcher action label, parameterized by the target language's own name. */
  switchLocale: (name: string) => string;
  /** Footer tmux-window nav group label. */
  siteWindowsAria: string;
  /** Home: recent-posts panel counter and empty state. */
  postsCount: (n: number) => string;
  noPosts: string;
  /** Header logout confirmation dialog. */
  logoutConfirmDescription: string;
}

export const chromeZh: ChromeMessages = {
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
  switchLocale: (name) => `切换到${name}`,
  siteWindowsAria: '站点窗口',
  postsCount: (n) => `${n} 篇文章`,
  noPosts: '暂无文章',
  logoutConfirmDescription: '确定要退出登录吗？',
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
  switchLocale: (name) => `Switch to ${name}`,
  siteWindowsAria: 'Site windows',
  postsCount: (n) => `${n} posts`,
  noPosts: 'no posts yet',
  logoutConfirmDescription: 'Log out?',
};
