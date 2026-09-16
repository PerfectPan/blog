import { expect, test } from '@playwright/test';

test('concurrent SSR requests keep page content and redirects isolated', async ({
  request,
}) => {
  const pages = [
    { path: '/', title: 'Home' },
    { path: '/projects', title: 'Projects' },
  ];

  for (let round = 0; round < 8; round++) {
    await Promise.all([
      ...pages.map(async ({ path, title }) => {
        const response = await request.get(path, {
          maxRedirects: 0,
          timeout: 15_000,
        });
        expect(response.status(), path).toBe(200);
        const html = await response.text();
        expect(html, path).toContain(`<title>${title} | `);
        expect(html, path).toContain('data-testid="nav-login"');
      }),
      ...['/admin/new', '/admin/comments'].map(async (path) => {
        const response = await request.get(path, {
          maxRedirects: 0,
          timeout: 15_000,
        });
        expect(response.status(), path).toBe(307);
        expect(response.headers().location, path).toBe('/login');
      }),
    ]);
  }
});
