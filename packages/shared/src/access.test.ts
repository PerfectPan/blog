import { describe, expect, it } from 'vitest';
import {
  canAccessVisibility,
  getUnlockCookieName,
  isRoleAtLeast,
  PASSWORD_UNLOCK_COOKIE_PREFIX,
} from './access.js';
import type { PostVisibility, Role } from './types.js';

/**
 * These are the security-critical rules behind the two-layer visibility model
 * (see docs/architecture.md §6). `canAccessVisibility` is invoked from server
 * fns that are reachable over RPC, so a regression here is an authorization
 * bypass — these tests lock the ladder in.
 */

const NON_PUBLIC: PostVisibility[] = ['member', 'vip', 'admin', 'password'];

describe('canAccessVisibility', () => {
  describe('public', () => {
    it('is readable by everyone, including guests', () => {
      expect(canAccessVisibility('public', null)).toBe(true);
      expect(canAccessVisibility('public', undefined)).toBe(true);
      expect(canAccessVisibility('public', 'member')).toBe(true);
      expect(canAccessVisibility('public', 'admin')).toBe(true);
    });
  });

  describe('password', () => {
    it('never grants access via role alone', () => {
      // Password posts are opened through the signed unlock cookie (or the
      // admin override) in blog-service — NOT through this function. Locking
      // this in prevents a regression that would let `canAccessVisibility`
      // silently expose them.
      for (const role of ['member', 'vip', 'admin'] as Role[]) {
        expect(canAccessVisibility('password', role)).toBe(false);
      }
      expect(canAccessVisibility('password', null)).toBe(false);
    });
  });

  describe('member', () => {
    it('requires at least the member role', () => {
      expect(canAccessVisibility('member', null)).toBe(false);
      expect(canAccessVisibility('member', 'member')).toBe(true);
      expect(canAccessVisibility('member', 'vip')).toBe(true);
      expect(canAccessVisibility('member', 'admin')).toBe(true);
    });
  });

  describe('vip', () => {
    it('requires at least the vip role', () => {
      expect(canAccessVisibility('vip', null)).toBe(false);
      expect(canAccessVisibility('vip', 'member')).toBe(false);
      expect(canAccessVisibility('vip', 'vip')).toBe(true);
      expect(canAccessVisibility('vip', 'admin')).toBe(true);
    });
  });

  describe('admin', () => {
    it('requires the admin role', () => {
      expect(canAccessVisibility('admin', null)).toBe(false);
      expect(canAccessVisibility('admin', 'member')).toBe(false);
      expect(canAccessVisibility('admin', 'vip')).toBe(false);
      expect(canAccessVisibility('admin', 'admin')).toBe(true);
    });
  });

  it('denies guests for every non-public visibility', () => {
    for (const visibility of NON_PUBLIC) {
      expect(canAccessVisibility(visibility, null)).toBe(false);
    }
  });
});

describe('isRoleAtLeast', () => {
  it('treats the role ladder as cumulative (member < vip < admin)', () => {
    expect(isRoleAtLeast('member', 'member')).toBe(true);
    expect(isRoleAtLeast('vip', 'member')).toBe(true);
    expect(isRoleAtLeast('admin', 'member')).toBe(true);

    expect(isRoleAtLeast('member', 'vip')).toBe(false);
    expect(isRoleAtLeast('member', 'admin')).toBe(false);
    expect(isRoleAtLeast('vip', 'admin')).toBe(false);

    expect(isRoleAtLeast('vip', 'vip')).toBe(true);
    expect(isRoleAtLeast('admin', 'admin')).toBe(true);
  });
});

describe('getUnlockCookieName', () => {
  it('namespaces the slug under the unlock prefix', () => {
    expect(getUnlockCookieName('hello-world')).toBe(
      `${PASSWORD_UNLOCK_COOKIE_PREFIX}hello-world`,
    );
  });

  it('uses the documented prefix constant', () => {
    expect(PASSWORD_UNLOCK_COOKIE_PREFIX).toBe('blog_unlock_');
  });
});
