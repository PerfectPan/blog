import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

type MarkdownProps = {
  content: string;
};

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
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
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
          pre: ({ children }) => (
            <pre className='shiki mb-2 -my-0.5 w-full overflow-x-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-4 dark:bg-shiki-dark'>
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
