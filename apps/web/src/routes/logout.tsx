import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/logout')({
  server: {
    handlers: {
      POST: async () =>
        new Response(null, {
          status: 307,
          headers: {
            location: '/api/auth/sign-out',
          },
        }),
    },
  },
  component: LogoutPage,
});

function LogoutPage() {
  return (
    <section className='card'>
      <h1>退出登录</h1>
      <p className='meta'>提交后将销毁会话 Cookie。</p>
      <form method='post'>
        <button type='submit' className='btn'>
          Logout
        </button>
      </form>
    </section>
  );
}
