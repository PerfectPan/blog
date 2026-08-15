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
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>cat posts/{slug}.md</span>
      </div>
      <p className='th-out'>
        <span className='th-nf-big'>
          cat: posts/{slug}.md: Permission denied
        </span>
      </p>
      <p className='th-out th-comment'>
        # 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。
      </p>
      <form method='post' className='mt-4'>
        <div className='th-field'>
          <label htmlFor='password'>password for this post</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='th-input'
          />
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          <button type='submit' className='th-btn th-btn-primary'>
            sudo unlock
          </button>
          <Link to='/blog/$slug' params={{ slug }} className='th-cd'>
            ← 返回文章
          </Link>
        </div>
        {errorLabel ? <p className='th-err'>{errorLabel}</p> : null}
      </form>
    </div>
  );
}
