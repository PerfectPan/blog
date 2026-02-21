import { Link, createFileRoute } from '@tanstack/react-router';
import {
  buildUnlockCookieHeader,
  createUnlockCookieValue,
} from '../../lib/unlock-cookie.js';
import {
  clearUnlockFailures,
  isUnlockRateLimited,
  recordUnlockFailure,
} from '../../lib/unlock-rate-limit.js';

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip');
}

export const Route = createFileRoute('/unlock/$slug')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const formData = await request.formData();
        const password = String(formData.get('password') ?? '').trim();
        const slug = params.slug;
        const ip = getClientIp(request);

        if (!password) {
          return Response.redirect(
            new URL(`/unlock/${slug}?error=missing`, request.url),
            303,
          );
        }

        if (isUnlockRateLimited(slug, ip)) {
          return new Response('Too many failed unlock attempts', {
            status: 429,
          });
        }

        const { verifyPostPasswordWithCms } = await import(
          '../../lib/cms-client.js'
        );
        const isValid = await verifyPostPasswordWithCms(slug, password);
        if (!isValid) {
          recordUnlockFailure(slug, ip);
          return Response.redirect(
            new URL(`/unlock/${slug}?error=invalid`, request.url),
            303,
          );
        }

        clearUnlockFailures(slug, ip);
        const cookie = buildUnlockCookieHeader(
          slug,
          createUnlockCookieValue(slug, 24 * 60 * 60 * 1000),
        );

        return new Response(null, {
          status: 303,
          headers: {
            'set-cookie': cookie,
            location: `/blog/${slug}`,
          },
        });
      },
    },
  },
  component: UnlockPage,
});

function UnlockPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch() as { error?: string };
  const errorLabel =
    search.error === 'missing'
      ? '请输入访问密码'
      : search.error === 'invalid'
        ? '密码错误，请重试'
        : undefined;

  return (
    <section className='mx-auto w-full max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>输入文章访问密码</h1>
      <p className='mb-6 opacity-70'>这篇文章使用了单文密码保护。</p>

      {errorLabel ? (
        <p role='alert' className='mb-4 text-sm text-red-700 dark:text-red-300'>
          {errorLabel}
        </p>
      ) : null}

      <form method='post' className='grid max-w-[420px] gap-3'>
        <label htmlFor='password' className='font-semibold'>
          Password
        </label>
        <input
          id='password'
          name='password'
          type='password'
          required
          className='rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark'
        />
        <button
          type='submit'
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-900'
        >
          Unlock
        </button>
      </form>

      <p className='mt-4'>
        <Link
          to='/blog/$slug'
          params={{ slug }}
          className='opacity-70 hover:opacity-100'
        >
          返回文章页
        </Link>
      </p>
    </section>
  );
}
