import { parseCookies } from './cookie.js';

export type Skin = 'terminal' | 'journal';

export const SKIN_COOKIE = 'blog-skin';

export function readSkinFromCookie(cookie: string | null): Skin {
  return parseCookies(cookie)[SKIN_COOKIE] === 'journal'
    ? 'journal'
    : 'terminal';
}

/** Browser-chrome color per skin (light mode; DarkMode overrides for dark). */
export const THEME_COLOR: Record<Skin, string> = {
  terminal: '#f4f2ec',
  journal: '#f6f3ec',
};
