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
    <section className='card'>
      <h1>输入文章访问密码</h1>
      <p className='meta'>这篇文章使用了单文密码保护。</p>

      {errorLabel ? (
        <p role='alert' className='meta' style={{ color: '#b3261e' }}>
          {errorLabel}
        </p>
      ) : null}

      <form method='post' className='unlock-form'>
        <label htmlFor='password'>Password</label>
        <input id='password' name='password' type='password' required />
        <button type='submit' className='btn'>
          Unlock
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        <Link to='/blog/$slug' params={{ slug }}>
          返回文章页
        </Link>
      </p>
    </section>
  );
}
