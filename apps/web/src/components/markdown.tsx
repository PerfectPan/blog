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

const HEADER_HEIGHT = 64;
const SAFE_HEIGHT = 16;

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const targetPosition = elementTop - (HEADER_HEIGHT + SAFE_HEIGHT);

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

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
      scrollToHeading(id);
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
                    scrollToHeading(id);
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
          pre: ({ children }) => (
            <pre className='shiki mb-2 whitespace-pre-wrap w-full overflow-x-auto -my-0.5 inline-block rounded-md bg-zinc-50 p-4 dark:bg-shiki-dark'>
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
