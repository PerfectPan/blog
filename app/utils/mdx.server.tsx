import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { compileMDX } from 'next-mdx-remote/rsc';
import { renderToString } from 'react-dom/server';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { MDXComponents } from '../components/mdx-runtime';
import { MDXWrapper } from '../components/mdx-wrapper';

const highlighter = await createHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-light.mjs'),
    import('shiki/themes/vitesse-dark.mjs'),
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/cpp.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/typescript.mjs'),
  ],
  engine: createOnigurumaEngine(() => import('shiki/wasm')),
});

export const renderMdxToHtml = async (source: string) => {
  const mdx = await compileMDX({
    source,
    components: MDXComponents,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [
          rehypeKatex,
          [
            rehypeShikiFromHighlighter,
            highlighter,
            {
              themes: {
                light: 'vitesse-light',
                dark: 'vitesse-dark',
              },
            },
          ],
        ],
      },
    },
  });

  const { content } = mdx;
  return renderToString(<MDXWrapper>{content}</MDXWrapper>);
};
