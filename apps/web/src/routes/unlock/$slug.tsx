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
        ? '密码不对，再试试！（连错会限流）'
        : undefined;

  return (
    <div className='f-page'>
      <div className='f-gate'>
        <div className='f-card f-lift f-gate-card'>
          <span
            className='f-sticker badge-top'
            style={{ background: '#FF6B35', color: '#fff' }}
          >
            🔒 LOCKED
          </span>
          <h1>解锁文章</h1>
          <p className='sub'>这篇用单文密码上着锁 ・ 输对后 24 小时免密</p>
          <form method='post'>
            <div className='f-field'>
              <label htmlFor='password'>文章密码</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='f-input'
              />
            </div>
            {errorLabel ? <p className='f-err'>{errorLabel}</p> : null}
            <div className='actions'>
              <button type='submit' className='f-btn f-btn-o'>
                解锁！
              </button>
              <Link to='/blog/$slug' params={{ slug }} className='f-btn'>
                ← 返回文章
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
