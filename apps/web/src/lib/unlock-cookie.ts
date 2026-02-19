import { createHmac, timingSafeEqual } from 'node:crypto';
import { getUnlockCookieName } from '@blog/shared';
import { getWebEnv } from './env.js';

const env = getWebEnv();

function sign(slug: string, expiresAt: number): string {
  return createHmac('sha256', env.betterAuthSecret)
    .update(`${slug}.${expiresAt}`)
    .digest('base64url');
}

export function createUnlockCookieValue(slug: string, ttlMs: number): string {
  const expiresAt = Date.now() + ttlMs;
  const signature = sign(slug, expiresAt);
  return `${expiresAt}.${signature}`;
}

export function isUnlockCookieValid(
  slug: string,
  value?: string | null,
): boolean {
  if (!value) {
    return false;
  }

  const [rawExpiresAt, rawSignature] = value.split('.');
  const expiresAt = Number.parseInt(rawExpiresAt ?? '', 10);
  if (!expiresAt || !rawSignature || Date.now() > expiresAt) {
    return false;
  }

  const expected = sign(slug, expiresAt);
  const signatureBuffer = Buffer.from(rawSignature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function parseCookies(
  rawCookieHeader: string | null,
): Record<string, string> {
  if (!rawCookieHeader) {
    return {};
  }

  return rawCookieHeader
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const index = item.indexOf('=');
      if (index <= 0) {
        return acc;
      }

      const key = item.slice(0, index).trim();
      const value = decodeURIComponent(item.slice(index + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

export function buildUnlockCookieHeader(slug: string, value: string): string {
  const cookieName = getUnlockCookieName(slug);
  const maxAge = 24 * 60 * 60;
  const attributes = [
    `${cookieName}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (env.cookieDomain) {
    attributes.push(`Domain=${env.cookieDomain}`);
  }

  if (env.appsWebUrl.startsWith('https://')) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

export function buildUnlockClearCookieHeader(slug: string): string {
  const cookieName = getUnlockCookieName(slug);
  const attributes = [
    `${cookieName}=`,
    'Max-Age=0',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (env.cookieDomain) {
    attributes.push(`Domain=${env.cookieDomain}`);
  }

  if (env.appsWebUrl.startsWith('https://')) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}
