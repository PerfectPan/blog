import { createFileRoute, Link } from '@tanstack/react-router';
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

        const { verifyPostPassword } = await import(
          '../../lib/content-service.js'
        );
        const isValid = await verifyPostPassword(slug, password);
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
    <div className='j-sheet'>
      <div className='j-gate'>
        <div className='j-gate-card text-center'>
          <div className='j-lockmark' aria-hidden='true'>
            锁
          </div>
          <h1>输入文章访问密码</h1>
          <p className='sub'>这篇文章使用了单文密码保护。</p>
          <form method='post' className='text-left'>
            <div className='j-field'>
              <label htmlFor='password'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='j-input'
              />
            </div>
            {errorLabel ? (
              <p className='j-err text-center'>{errorLabel}</p>
            ) : null}
            <div className='j-actions justify-center'>
              <button type='submit' className='j-btn j-btn-red'>
                Unlock
              </button>
            </div>
          </form>
          <p className='j-aside'>
            <Link
              to='/blog/$slug'
              params={{ slug }}
              style={{ color: 'var(--j-indigo)' }}
            >
              返回文章页
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
