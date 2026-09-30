import katexCssHref from 'katex/dist/katex.min.css?url';

/**
 * URL of the emitted katex stylesheet. The CSS is deliberately NOT part of
 * the global styles.css: only pages whose rendered HTML actually contains
 * math (article pages, admin preview) link it from their head(), so every
 * other page skips the ~20KB of blocking CSS plus font declarations.
 */
export const KATEX_CSS_HREF = katexCssHref;
