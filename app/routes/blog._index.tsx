import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getBlogList } from '../utils/posts.server';

export const loader = async (_args: LoaderFunctionArgs) => {
  const blogList = await getBlogList();
  return json({ blogList });
};

export const meta: MetaFunction = () => [
  { title: "Blog | PerfectPan's Blog" },
  { name: 'description', content: "Blog | PerfectPan's Blog" },
  { property: 'og:title', content: "Blog | PerfectPan's Blog" },
  { property: 'og:description', content: "Blog | PerfectPan's Blog" },
];

export default function BlogPage() {
  const { blogList } = useLoaderData<typeof loader>();

  return (
    <div className='flex flex-col gap-8'>
      <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
        {blogList.map((group) => {
          return (
            <div key={group.year}>
              <div className='text-3xl mb-4'>{group.year}</div>
              {group.blogs.map((blog) => (
                <div
                  key={blog.name}
                  className='mt-2 mb-6 opacity-70 hover:opacity-100'
                >
                  <Link
                    to={`/blog/${blog.name}`}
                    className='flex gap-2 items-center'
                  >
                    <span className='text-lg leading-[1.2em]'>
                      {blog.title}
                    </span>
                    <span className='text-sm opacity-50'>
                      {new Date(blog.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Link to='/' className='mt-4 inline-block'>
        <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
        <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
      </Link>
    </div>
  );
}
