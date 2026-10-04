import type { Locale } from '@blog/shared';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CommentMarkdownBody } from '../components/comment-markdown.js';
import { Markdown } from '../components/markdown.js';
import { LocaleProvider } from './i18n/context.js';

/**
 * SERVER-ONLY markdown → HTML rendering.
 *
 * Import exclusively from server contexts (server-fn handler modules,
 * server.tsx); pulling this into a client module would drag react-markdown +
 * remark + rehype-katex back into the browser bundle. The whole point of
 * this module is that the markdown pipeline runs once, on the worker, and
 * the client receives ready HTML it can hydrate as a single node (see
 * components/markdown-view.tsx for the client-side enhancer).
 *
 * Keep this module free of `createServerFn` exports: modules that mix plain
 * exports with server fns are not rewritten to RPC stubs on the client, so
 * the render code would ship (the RPC wrappers live in markdown-preview.ts).
 *
 * Rendering reuses the exact react-markdown components the client used to
 * run (components/markdown.tsx, comment-markdown.tsx), so the HTML is
 * byte-equivalent to the old SSR output — same classes, same structure.
 */

function wrapWithLocale(locale: Locale, element: ReactElement) {
  return renderToStaticMarkup(
    <LocaleProvider initialLocale={locale}>{element}</LocaleProvider>,
  );
}

/** Render a post body (GFM + math + code-block chrome) to HTML. */
export function renderPostHtml(content: string, locale: Locale): string {
  if (!content) return '';
  return wrapWithLocale(locale, <Markdown content={content} />);
}

/** Render a comment body (inline GFM only, no katex/shiki) to inner HTML. */
export function renderCommentHtml(content: string): string {
  if (!content) return '';
  return renderToStaticMarkup(<CommentMarkdownBody content={content} />);
}

/** True when rendered post HTML contains KaTeX markup (needs the katex CSS). */
export function htmlHasKatex(html: string): boolean {
  return html.includes('class="katex"');
}
