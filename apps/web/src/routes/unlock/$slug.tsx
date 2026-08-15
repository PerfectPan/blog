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
        ? '口令有误，请再试'
        : undefined;

  return (
    <div className='z-page'>
      <div className='z-gate'>
        <div className='z-lock' aria-hidden='true'>
          鍵
        </div>
        <h1>解　鎖</h1>
        <p className='sub'>
          この記事は一言パスワードで封をされている ・ 24 時間有効
        </p>
        <form method='post'>
          <div className='z-field'>
            <label htmlFor='password'>篇 目 口 令</label>
            <input
              id='password'
              name='password'
              type='password'
              required
              className='z-input'
            />
          </div>
          {errorLabel ? <p className='z-err'>{errorLabel}</p> : null}
          <div className='actions'>
            <button type='submit' className='z-btn z-btn-fill'>
              启 封
            </button>
          </div>
        </form>
        <p className='aside'>
          <Link to='/blog/$slug' params={{ slug }} className='z-link'>
            ← 返回文章
          </Link>
        </p>
      </div>
    </div>
  );
}
