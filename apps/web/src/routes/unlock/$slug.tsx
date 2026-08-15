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
    <div className='e-board'>
      <section className='e-sheet' style={{ maxWidth: 540, margin: '0 auto' }}>
        <span className='e-tick tl' aria-hidden='true' />
        <span className='e-tick tr' aria-hidden='true' />
        <span className='e-tick bl' aria-hidden='true' />
        <span className='e-tick br' aria-hidden='true' />
        <div className='e-sheet-head'>
          <span className='dwg'>DWG NO. PP-AUTH-03</span>
          <span className='dwg' style={{ color: 'var(--e-red)' }}>
            STATUS: LOCKED
          </span>
        </div>
        <div className='e-gate'>
          <h1>UNLOCK / 解锁图纸</h1>
          <p className='sub'>此篇以单文密码封缄 ・ 验后 24 小时免复输入</p>
          <form method='post'>
            <div className='e-field'>
              <label htmlFor='password'>POST PASSWORD</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                className='e-input'
              />
            </div>
            {errorLabel ? <p className='e-err'>{errorLabel}</p> : null}
            <div className='e-actions'>
              <button type='submit' className='e-btn e-btn-fill'>
                UNLOCK
              </button>
              <Link to='/blog/$slug' params={{ slug }} className='e-btn'>
                ← BACK
              </Link>
            </div>
          </form>
        </div>
        <div className='e-titleblock'>
          <span className='cell'>
            <b>PP-AUTH-03</b>
          </span>
          <span className='cell'>
            TITLE<b>密笺</b>
          </span>
        </div>
      </section>
    </div>
  );
}
