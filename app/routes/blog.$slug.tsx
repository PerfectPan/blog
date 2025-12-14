import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { MDXWrapper } from '../components/mdx-wrapper';
import { Utterances } from '../components/utterances';
import { findBlogFileName, readBlog, renderMdxToHtml } from '../utils';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const slug = params.slug;
  if (!slug) {
    throw new Response('Not Found', { status: 404 });
  }

  const fileName = await findBlogFileName(slug);
  if (!fileName) {
    throw new Response('Not Found', { status: 404 });
  }

  const { source, metadata } = await readBlog(fileName);
  const html = await renderMdxToHtml(source);
  const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return json({
    slug,
    html,
    metadata: { ...metadata, formattedDate },
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  const title = `${data.metadata.title} | PerfectPan's Blog`;
  const description = data.metadata.description;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
  ];
};

export default function BlogArticlePage() {
  const { slug, html, metadata } = useLoaderData<typeof loader>();

  return (
    <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <div className='flex flex-col gap-2 m-auto mb-8'>
        <div className='text-3xl font-black'>{metadata.title}</div>
        <div className='opacity-60'>{metadata.formattedDate}</div>
      </div>
      <MDXWrapper html={html} />
      <Link to='/blog' className='mt-4 inline-block'>
        <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
        <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
      </Link>
      <Utterances slug={slug} />
    </div>
  );
}
