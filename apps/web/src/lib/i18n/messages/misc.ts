/**
 * Misc UI: not-found / error pages, dark-mode toggle, code copy, confirm
 * dialog and the cmd-k search palette.
 *
 * Terminal command output (bash errors, the grep prompt, `#` comment lines)
 * is part of the design language and keeps its value in both locales; the
 * grep placeholder keeps its command shape while its quoted Chinese
 * placeholder word (关键词) becomes an English one (pattern) for en.
 * Functional copy (copy button, dialog defaults, theme label) is localized.
 */
export interface MiscMessages {
  /** 404 page: `#` comment line and the back-link hint. */
  notFoundComment: string;
  backToBlogList: string;
  /** Error page: curl-style failure line, keeps the error text appended. */
  requestFailed: (error: string) => string;
  /** Dark-mode toggle aria-label (`next` / `current` are localized pref names). */
  switchModeAria: (next: string, current: string) => string;
  /** Visible label for the current theme pref on the toggle. */
  themeLabel: (pref: 'light' | 'dark' | 'system') => string;
  /** Code-block copy button: aria-label and idle / copied labels. */
  copyAria: string;
  copyLabel: string;
  copiedLabel: string;
  /** ConfirmDialog default button labels (callers override per dialog). */
  confirm: string;
  cancel: string;
  /** Search palette: grep prompt, empty state and key hints. */
  searchPlaceholder: string;
  searchIdleHint: string;
  searchNoMatches: string;
  searchHints: string;
}

export const miscZh: MiscMessages = {
  notFoundComment: '# 你闯入了无人之境。',
  backToBlogList: '← 回到博客列表',
  requestFailed: (error) => `Request failed: ${error}`,
  switchModeAria: (next, current) => `切换到${next}模式（当前：${current}）`,
  themeLabel: (pref) =>
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
};

export const miscEn: MiscMessages = {
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
};
