import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { compileMDX } from 'next-mdx-remote/rsc';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { Link } from 'waku';
import { MDXComponents } from '../../components/mdx-runtime/index.js';
import { MDXWrapper } from '../../components/mdx-wrapper.js';
import { Meta } from '../../components/meta.js';
import { Utterances } from '../../components/utterances.js';
import { getMetaData } from '../../utils/index.js';

type BlogArticlePageProps = {
  slug: string;
};

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

export default async function BlogArticlePage({ slug }: BlogArticlePageProps) {
  const fileName = await getFileName(slug);

  if (!fileName) {
    return null;
  }

  const path = `./content/blog/${fileName}`;
  const source = readFileSync(path, 'utf8');
  const metadata = await getMetaData(fileName);

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

  const date = new Date(metadata.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Meta
        title={`${metadata.title} | PerfectPan's Blog`}
        description={metadata.description}
      />
      <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
        <div className='flex flex-col gap-2 m-auto mb-8'>
          <div className='text-3xl font-black'>{metadata.title}</div>
          <div className='opacity-60'>{date}</div>
        </div>
        <MDXWrapper>{content}</MDXWrapper>
        <Link to='/blog' className='mt-4 inline-block'>
          <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
          <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
        </Link>
        <Utterances slug={slug} />
      </div>
    </>
  );
}

const getFileName = async (slug: string) => {
  const blogList = readdirSync('./content/blog');
  for (const fileName of blogList) {
    if (path.basename(fileName, '.md') === slug) {
      return fileName;
    }
  }

  return '';
};

export const getConfig = async () => {
  const blogPaths = await getBlogPaths();

  return {
    render: 'static',
    staticPaths: blogPaths,
  };
};

const getBlogPaths = async () => {
  const blogPaths: Array<string> = [];

  for (const fileName of readdirSync('./content/blog')) {
    blogPaths.push(path.basename(fileName, path.extname(fileName)));
  }

  return blogPaths;
};
