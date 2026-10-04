import { expect, test } from '@playwright/test';

for (const path of ['/login', '/signup']) {
  test(`${path} controls wait for hydration`, async ({ page }) => {
    let releaseScripts = () => {};
    const released = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    try {
      await page.route('**/*', async (route) => {
        if (route.request().resourceType() === 'script') await released;
        return route.continue();
      });
      await page.goto(path, { waitUntil: 'commit' });
      const email = page.locator('#email');
      const password = page.locator('#password');
      const submit = page.locator('form button[type="submit"]');
      await expect(email).toBeVisible();
      await expect(email).toBeDisabled();
      await expect(password).toBeDisabled();
      await expect(submit).toBeDisabled();
      await expect(page.locator('form button[type="button"]')).toBeDisabled();
      if (path === '/signup')
        await expect(page.locator('#name')).toBeDisabled();

      releaseScripts();
      await expect(email).toBeEnabled({ timeout: 30000 });
      await expect(password).toBeEnabled();
      await expect(submit).toBeEnabled();
    } finally {
      releaseScripts();
    }
  });
}

function createUniqueEmail(): string {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `e2e-logout-${suffix}@example.com`;
}

test('signup and logout refresh session and route data with the service worker', async ({
  page,
}) => {
  const email = createUniqueEmail();
  const sessionRequests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/get-session' || path.startsWith('/_serverFn/'))
      sessionRequests.push(request.url());
  });
  await page.goto('/signup', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('html[data-hydrated]');
  // Observe mount effects: SSR already resolved the guest, so hydration
  // must not launch a second identity lookup.
  await page.waitForTimeout(500);
  expect(sessionRequests).toEqual([]);
  await page.evaluate(async () => {
    const legacyCache = await caches.open('perfectpan-blog-v1');
    await legacyCache.put('/blog', new Response('old personalized HTML'));
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => resolve(),
          { once: true },
        );
      });
    }
    // Prime the guest response: the old worker served it again after signup.
    await fetch('/api/auth/get-session');
  });

  // Form anchors are theme-stable: field ids on /signup + the submit button.
  // Header anchors use data-testid because the visible labels are localized
  // (登录 / login) while the test ids are not.
  await page.locator('#name').fill('E2E Logout');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Playwright!12345');
  await page.locator('form button[type="submit"]').click();

  // Sign-up lands on /account, which shows the new, unverified account
  // (the e2e server has no mail configured).
  await page.waitForURL('**/account', { timeout: 15_000 });
  await expect(page.getByTestId('nav-logout')).toBeVisible();
  await expect(page.getByText('(not verified)')).toBeVisible();
  await expect(page.getByRole('button', { name: 'link github' })).toBeVisible();

  const signedInHtml = await (await page.request.get('/blog')).text();
  expect(signedInHtml).toContain('data-testid="nav-logout"');
  expect(signedInHtml).not.toContain('data-testid="nav-login"');
  sessionRequests.length = 0;
  await page.reload();
  await expect(page.getByTestId('nav-logout')).toBeVisible();
  await page.waitForSelector('html[data-hydrated]');
  await page.waitForTimeout(500);
  expect(sessionRequests).toEqual([]);

  await page.getByRole('link', { name: '1:posts', exact: true }).click();
  await expect(
    page.getByText('当前身份：会员；可见范围：公开/会员'),
  ).toBeVisible();

  await page.getByTestId('nav-logout').click();

  // The terminal theme asks for confirmation before signing out.
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'logout' })
    .click();

  await page.waitForURL('**/blog');
  await expect(page.getByTestId('nav-login')).toBeVisible();
  await expect(page.getByTestId('nav-logout')).toHaveCount(0);
  await expect(page.getByText('当前身份：游客；可见范围：公开')).toBeVisible();
  const loginTab = await page.context().newPage();
  await loginTab.goto('/login');
  await loginTab.locator('#email').fill(email);
  await loginTab.locator('#password').fill('Playwright!12345');
  await loginTab.locator('form button[type="submit"]').click();
  await expect(loginTab).toHaveURL(/\/blog$/);
  await page.bringToFront();
  // Headless tabs can all remain visible; exercise the app's visibility
  // listener and allow its five-second revalidation throttle to expire.
  await expect
    .poll(
      async () => {
        await page.evaluate(() =>
          document.dispatchEvent(new Event('visibilitychange')),
        );
        return page.getByTestId('nav-logout').count();
      },
      { timeout: 10_000 },
    )
    .toBe(1);
  await expect(
    page.getByText('当前身份：会员；可见范围：公开/会员'),
  ).toBeVisible();
  await loginTab.close();
  const cachedPaths = await page.evaluate(async () => {
    const names = await caches.keys();
    return (
      await Promise.all(
        names.map(async (name) => {
          const cache = await caches.open(name);
          return (await cache.keys()).map(
            (request) => new URL(request.url).pathname,
          );
        }),
      )
    ).flat();
  });
  expect(
    cachedPaths.filter(
      (path) =>
        path.startsWith('/api/') ||
        path.startsWith('/_server') ||
        path === '/' ||
        path === '/blog',
    ),
  ).toEqual([]);
  expect(await page.evaluate(() => caches.keys())).not.toContain(
    'perfectpan-blog-v1',
  );
});

test('account fetch errors are visible and can be retried', async ({
  page,
}) => {
  const email = createUniqueEmail();
  await page.goto('/signup');
  await page.locator('#name').fill('Account Retry');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill('Playwright!12345');
  await page.route('**/api/auth/list-accounts', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Account service unavailable' }),
    }),
  );
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByRole('alert')).toHaveText(
    'Account service unavailable',
  );
  await page.unroute('**/api/auth/list-accounts');
  await page.getByRole('button', { name: 'retry', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'link github', exact: true }),
  ).toBeVisible();
  await expect(page.locator('dl')).toContainText(email);
});
