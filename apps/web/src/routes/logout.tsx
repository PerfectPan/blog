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
    <section className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>退出登录</h1>
      <p className='mb-6 opacity-70'>提交后将销毁会话 Cookie。</p>
      <form method='post'>
        <button
          type='submit'
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
        >
          Logout
        </button>
      </form>
    </section>
  );
}
