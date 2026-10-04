import { beforeEach, expect, it, vi } from 'vitest';
import { auth } from '../src/lib/auth.js';
import { getD1 } from '../src/lib/db.js';
import { getSessionUserFromRequest } from '../src/lib/session-core.js';

vi.mock('@tanstack/react-start/server', () => ({ getRequest: vi.fn() }));
vi.mock('../src/lib/auth.js', () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock('../src/lib/db.js', () => ({ getD1: vi.fn() }));
vi.mock('../src/lib/env.js', () => ({
  getWebEnv: () => ({ adminEmailAllowlist: [] }),
}));

const localeRead = vi.fn();
const getSession = vi.mocked(auth.api.getSession);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getD1).mockReturnValue({
    prepare: () => ({ bind: () => ({ first: localeRead }) }),
  } as unknown as D1Database);
  localeRead.mockResolvedValue({ locale: 'en' });
});

function session(id: string) {
  return {
    user: { id, email: `${id}@example.test`, name: id, emailVerified: true },
    session: { token: 'server-only-token', ipAddress: 'server-only-address' },
  } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;
}

it('shares one lookup between concurrent loaders on the same Request', async () => {
  getSession.mockResolvedValue(session('alice'));
  const request = new Request('https://blog.test/blog');
  const [root, child] = await Promise.all([
    getSessionUserFromRequest(request),
    getSessionUserFromRequest(request),
  ]);
  expect(root).toBe(child);
  expect(getSession).toHaveBeenCalledTimes(1);
  expect(localeRead).toHaveBeenCalledTimes(1);
  expect(root).toEqual({
    id: 'alice',
    email: 'alice@example.test',
    name: 'alice',
    emailVerified: true,
    role: 'member',
    locale: 'en',
  });
});

it('never reuses identity across separate Requests, even with identical URLs', async () => {
  getSession
    .mockResolvedValueOnce(session('alice'))
    .mockResolvedValueOnce(session('bob'));
  const users = await Promise.all([
    getSessionUserFromRequest(new Request('https://blog.test/')),
    getSessionUserFromRequest(new Request('https://blog.test/')),
  ]);
  expect(users.map((user) => user?.id)).toEqual(['alice', 'bob']);
  expect(getSession).toHaveBeenCalledTimes(2);
});

it('keeps guests anonymous without querying user metadata', async () => {
  getSession.mockResolvedValue(null);
  const request = new Request('https://blog.test/');
  expect(await getSessionUserFromRequest(request)).toBeNull();
  expect(await getSessionUserFromRequest(request)).toBeNull();
  expect(getSession).toHaveBeenCalledTimes(1);
  expect(localeRead).not.toHaveBeenCalled();
});

it('fails closed on an auth error without poisoning later requests', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    getSession
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValueOnce(session('alice'));
    expect(
      await getSessionUserFromRequest(new Request('https://blog.test/')),
    ).toBeNull();
    expect(
      await getSessionUserFromRequest(new Request('https://blog.test/')),
    ).toMatchObject({ id: 'alice' });
  } finally {
    log.mockRestore();
  }
});
