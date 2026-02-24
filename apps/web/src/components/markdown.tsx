import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

type MarkdownProps = {
  content: string;
};

const highlighter = await createHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-light.mjs'),
    import('shiki/themes/vitesse-dark.mjs'),
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/jsx.mjs'),
    import('shiki/langs/tsx.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/bash.mjs'),
    import('shiki/langs/yaml.mjs'),
    import('shiki/langs/markdown.mjs'),
    import('shiki/langs/cpp.mjs'),
    import('shiki/langs/c.mjs'),
    import('shiki/langs/go.mjs'),
    import('shiki/langs/java.mjs'),
    import('shiki/langs/python.mjs'),
    import('shiki/langs/rust.mjs'),
    import('shiki/langs/sql.mjs'),
  ],
  engine: createOnigurumaEngine(() => import('shiki/wasm')),
});

export function Markdown({ content }: MarkdownProps) {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#')) {
      return;
    }

    requestAnimationFrame(() => {
      const id = decodeURIComponent(hash.slice(1));
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    });
  }, []);

  return (
    <article>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
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
        ]}
        components={{
          h2: ({ children }) => {
            const id = typeof children === 'string' ? children : '';

            return (
              <h2
                id={id}
                className='mb-6 mt-14 text-balance text-2xl leading-none font-black first:mt-0'
              >
                <a
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    window.history.pushState('', '', `#${id}`);
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  {id}
                </a>
              </h2>
            );
          },
          p: ({ children }) => <p className='mb-6 leading-7'>{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className='text-blue-700/80 transition-colors duration-300 ease-in-out hover:text-blue-700'
              target='_blank'
              rel='noreferrer'
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <b className='font-extrabold'>{children}</b>
          ),
          ul: ({ children }) => (
            <ul className='mb-4 ml-4 list-disc'>{children}</ul>
          ),
          pre: ({ children, className, node: _node, ...props }) => (
            <pre
              className={`mb-2 -my-0.5 w-full overflow-x-auto rounded-md ${className ?? ''}`}
              {...props}
            >
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
