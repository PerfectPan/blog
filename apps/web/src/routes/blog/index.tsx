import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { BlogList } from '../../components/blog-list.js';
import { getBlogListServerFn } from '../../lib/blog-service.js';
import { type TFn, useT } from '../../lib/i18n/context.js';
import {
  DEV_HINT_ADMIN,
  DEV_HINT_GUEST,
  DEV_HINT_MEMBER,
  DEV_HINT_VIP,
} from '../../lib/i18n/messages.js';

function getDevScopeHint(
  sessionUser: SessionUser | null | undefined,
  t: TFn,
): string {
  if (!sessionUser) {
    return t(DEV_HINT_GUEST);
  }

  if (sessionUser.role === 'admin') {
    return t(DEV_HINT_ADMIN);
  }

  if (sessionUser.role === 'vip') {
    return t(DEV_HINT_VIP);
  }

  return t(DEV_HINT_MEMBER);
}

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: "Blog | PerfectPan's Blog" },
      { name: 'description', content: "Blog | PerfectPan's Blog" },
    ],
  }),
  validateSearch: z.object({
    page: z.coerce.number().int().min(1).optional(),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => {
    const data = await getBlogListServerFn({ data: { page: deps.page ?? 1 } });
    return {
      ...data,
      isDev: process.env.NODE_ENV === 'development',
    };
  },
  component: BlogListPage,
});

function BlogListPage() {
  const data = Route.useLoaderData();
  const t = useT();
  const showDevHint = data.isDev;
  const devScopeHint = getDevScopeHint(data.sessionUser, t);
  const showVisibility = data.posts.some(
    (post: PostSummary) => post.visibility !== 'public',
  );

  // Conventional blog pagination: the page scrolls naturally; jump back to the
  // top on each page change so the new page starts at its first post.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [data.page]);

  return (
    <BlogList
      data={data}
      showDevHint={showDevHint}
      devScopeHint={devScopeHint}
      showVisibility={showVisibility}
    />
  );
}
