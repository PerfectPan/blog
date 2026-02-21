import type { PostSummary } from '@blog/shared';
import { Link, createFileRoute } from '@tanstack/react-router';
import { getBlogListServerFn } from '../../lib/blog-service.js';

type BlogGroup = {
  year: string;
  blogs: PostSummary[];
};

function groupByYear(posts: PostSummary[]): BlogGroup[] {
  const groups = new Map<string, PostSummary[]>();

  for (const post of posts) {
    const year = new Date(post.publishedAt).getFullYear().toString();
    const existing = groups.get(year);
    if (existing) {
      existing.push(post);
    } else {
      groups.set(year, [post]);
    }
  }

  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, blogs]) => ({
      year,
      blogs: [...blogs].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    }));
}

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: "Blog | PerfectPan's Blog" },
      { name: 'description', content: "Blog | PerfectPan's Blog" },
    ],
  }),
  loader: async () => getBlogListServerFn(),
  component: BlogListPage,
});

function BlogListPage() {
  const data = Route.useLoaderData();
  const blogGroups = groupByYear(data.posts);

  return (
    <div className='flex flex-col gap-8'>
      <div className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div className='mb-4 text-3xl'>{group.year}</div>
            {group.blogs.map((blog: PostSummary) => (
              <div
                key={blog.slug}
                className='mt-2 mb-6 opacity-70 transition-opacity hover:opacity-100'
              >
                <Link
                  to='/blog/$slug'
                  params={{ slug: blog.slug }}
                  className='flex items-center gap-2'
                >
                  <span className='text-lg leading-[1.2em]'>{blog.title}</span>
                  <span className='text-sm opacity-50'>
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>
      <Link to='/' className='mt-4 inline-block'>
        <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
        <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
      </Link>
    </div>
  );
}
