import { Link, createFileRoute } from '@tanstack/react-router';
import { getBlogListServerFn } from '../../lib/blog-service.js';

export const Route = createFileRoute('/blog/')({
  loader: async () => getBlogListServerFn(),
  component: BlogListPage,
});

function BlogListPage() {
  const data = Route.useLoaderData();

  return (
    <section>
      <h1>Blog</h1>
      <p className='meta'>
        当前身份：
        {data.sessionUser
          ? `${data.sessionUser.email} (${data.sessionUser.role})`
          : '游客'}
      </p>

      <ul className='post-list'>
        {data.posts.map((post) => (
          <li key={post.slug}>
            <Link
              className='post-link'
              to='/blog/$slug'
              params={{ slug: post.slug }}
            >
              <div>
                <strong>{post.title}</strong>
                <span className='status-chip'>{post.visibility}</span>
              </div>
              <div className='meta'>{post.description}</div>
              <div className='meta'>
                {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
