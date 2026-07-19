import { describe, expect, it } from 'vitest';
import {
  canAccessComments,
  canAccessVisibility,
  canManageComment,
  getUnlockCookieName,
  isCommentVisibleTo,
  isRoleAtLeast,
  PASSWORD_UNLOCK_COOKIE_PREFIX,
} from './access.js';
import type { PostVisibility, Role, SessionUser } from './types.js';

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

// `canAccessComments` gates comment reads/writes by the *post's* visibility.
// It is the §6 data-layer guard called from inside `getCommentsServerFn` /
// `createCommentServerFn`, which are reachable over RPC — a regression here is
// an authorization bypass that leaks comments on member/vip/admin/password
// posts to anyone who crafts an RPC call.
describe('canAccessComments', () => {
  it('lets everyone read comments on public posts', () => {
    expect(canAccessComments('public', null, false)).toBe(true);
    expect(canAccessComments('public', 'member', false)).toBe(true);
    expect(canAccessComments('public', 'admin', false)).toBe(true);
  });

  it('gates member/vip/admin posts by the role ladder', () => {
    expect(canAccessComments('member', null, false)).toBe(false);
    expect(canAccessComments('member', 'member', false)).toBe(true);
    expect(canAccessComments('vip', 'member', false)).toBe(false);
    expect(canAccessComments('vip', 'vip', false)).toBe(true);
    expect(canAccessComments('admin', 'vip', false)).toBe(false);
    expect(canAccessComments('admin', 'admin', false)).toBe(true);
  });

  it('gates password posts solely by the unlocked flag (role is irrelevant)', () => {
    // unlocked already folds in `role === 'admin' || validUnlockCookie`.
    expect(canAccessComments('password', null, false)).toBe(false);
    expect(canAccessComments('password', 'member', false)).toBe(false);
    expect(canAccessComments('password', 'admin', false)).toBe(false);
    expect(canAccessComments('password', null, true)).toBe(true);
    expect(canAccessComments('password', 'member', true)).toBe(true);
  });
});

describe('isCommentVisibleTo', () => {
  it('shows every status to admins', () => {
    for (const status of ['visible', 'hidden', 'spam'] as const) {
      expect(isCommentVisibleTo(status, 'admin')).toBe(true);
    }
  });

  it('shows only visible comments to non-admins and guests', () => {
    expect(isCommentVisibleTo('visible', 'member')).toBe(true);
    expect(isCommentVisibleTo('visible', null)).toBe(true);
    expect(isCommentVisibleTo('hidden', 'member')).toBe(false);
    expect(isCommentVisibleTo('hidden', null)).toBe(false);
    expect(isCommentVisibleTo('spam', 'vip')).toBe(false);
  });
});

describe('canManageComment', () => {
  const author: SessionUser = { id: 'u-author', role: 'member', email: 'a@x' };
  const other: SessionUser = { id: 'u-other', role: 'member', email: 'b@x' };
  const admin: SessionUser = { id: 'u-admin', role: 'admin', email: 'c@x' };

  it('lets the author act on their own comment', () => {
    expect(canManageComment('u-author', author)).toBe(true);
  });

  it('lets an admin act on anyone’s comment', () => {
    expect(canManageComment('u-author', admin)).toBe(true);
    expect(canManageComment('u-other', admin)).toBe(true);
  });

  it('rejects guests and non-owner non-admins', () => {
    expect(canManageComment('u-author', null)).toBe(false);
    expect(canManageComment('u-author', undefined)).toBe(false);
    expect(canManageComment('u-author', other)).toBe(false);
  });
});
