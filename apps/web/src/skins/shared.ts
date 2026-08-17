import type { PostSummary, SessionUser } from '@blog/shared';
import { PAGE_SIZE } from '@blog/shared';
import type { Project } from '../lib/projects.js';

export { PAGE_SIZE };

export type BlogListData = {
  posts: PostSummary[];
  total: number;
  page: number;
  totalPages: number;
};

/** Group posts by year, newest year first, newest post first within a year. */
export function groupByYear(
  posts: PostSummary[],
): { year: string; blogs: PostSummary[] }[] {
  const groups = new Map<string, PostSummary[]>();
  for (const post of posts) {
    const year = new Date(post.publishedAt).getFullYear().toString();
    const existing = groups.get(year);
    if (existing) {
      existing.push(post);
    } else {
      groups.set(year, [post]);
    }
  }
  return [...groups.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, blogs]) => ({
      year,
      blogs: [...blogs].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      ),
    }));
}

/** Featured first, then alphabetical — the order both project lists render. */
export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (Boolean(a.featured) === Boolean(b.featured)) {
      return a.name.localeCompare(b.name);
    }
    return a.featured ? -1 : 1;
  });
}

export function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }
  if (role === 'vip') {
    return 'VIP';
  }
  return 'MEMBER';
}

/** Chinese relative-date formatter for comment timestamps. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) {
    return iso;
  }
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) {
    return '刚刚';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} 分钟前`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时前`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} 天前`;
  }
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Map the unlock route's ?error= search param to a Chinese message. */
export function unlockErrorLabel(
  search?: Record<string, string | undefined>,
): string | undefined {
  const error = (search ?? {}).error;
  if (error === 'missing') {
    return '请输入访问密码';
  }
  if (error === 'invalid') {
    return '密码错误，请重试';
  }
  return undefined;
}

export type { SessionUser };
