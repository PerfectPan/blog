import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
// @ts-expect-error no exported member
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeShikiFromHighlighter from '@shikijs/rehype/core';
import { getHighlighterCore } from 'shiki/core';
import { Meta } from '../../components/meta.js';
import { getMetaData } from '../../utils/index.js';

type BlogArticlePageProps = {
  slug: string;
};

const highlighter = await getHighlighterCore({
  themes: [
    import('shiki/themes/vitesse-light.mjs'),
    import('shiki/themes/vitesse-dark.mjs')
  ],
  langs: [
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/cpp.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/typescript.mjs'),
  ],
  loadWasm: import('shiki/wasm')
})

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
    components: {},
    options: { 
      parseFrontmatter: true, 
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex, [rehypeShikiFromHighlighter, highlighter, {
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          }
        }]]
      } 
    },
  });

  const { content } = mdx;

  // const date = new Date(metadata.date).toLocaleDateString('en-US', {
  //   month: 'long',
  //   day: 'numeric',
  //   year: 'numeric',
  // });

  return (
    <>
      <Meta
        title={`${metadata.title} | PerfectPan's Blog`}
        description={metadata.description}
      />
      <div className="mx-auto w-full max-w-[80ch] pt-20 lg:pt-24">
        {content}
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
  };

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

  readdirSync('./content/blog').forEach((fileName) => {
    blogPaths.push(path.basename(fileName, path.extname(fileName)));
  });

  return blogPaths;
};
