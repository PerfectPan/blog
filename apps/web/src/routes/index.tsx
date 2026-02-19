import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <section className='hero'>
      <h1>可控访问的博客系统</h1>
      <p className='meta'>
        新站使用 TanStack Start + Payload，支持登录、角色权限、文章密码访问。
      </p>
      <p>
        <Link to='/blog'>进入 Blog</Link>
      </p>
    </section>
  );
}
