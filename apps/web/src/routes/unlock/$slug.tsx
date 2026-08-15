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
        ? '密码错误，请重试（连续失败会触发限流）'
        : undefined;

  return (
    <div className='c-page'>
      <div className='c-auth'>
        <div className='c-auth-head'>
          <h1>解锁文章</h1>
          <span className='c-no'>AUTH / 03</span>
        </div>
        <div className='c-auth-card'>
          <div className='c-lockline'>LOCKED ENTRY</div>
          <form method='post'>
            <div className='c-field'>
              <label htmlFor='password'>单文密码</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='c-input'
              />
            </div>
            {errorLabel ? <p className='c-err'>{errorLabel}</p> : null}
            <div className='c-actions'>
              <button type='submit' className='c-btn c-btn-solid'>
                解锁
              </button>
              <Link
                to='/blog/$slug'
                params={{ slug }}
                className='c-btn c-btn-ghost'
              >
                ← 返回文章
              </Link>
            </div>
          </form>
          <p className='c-aside'>验证后 24 小时内免密阅读本篇。</p>
        </div>
      </div>
    </div>
  );
}
