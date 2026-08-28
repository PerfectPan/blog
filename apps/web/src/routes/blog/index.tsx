import type { PostSummary, SessionUser } from '@blog/shared';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { getBlogListServerFn } from '../../lib/blog-service.js';
import { useSkin } from '../../skins/context.js';
import { JournalBlogList } from '../../skins/journal/blog-list.js';
import { TerminalBlogList } from '../../skins/terminal/blog-list.js';

function getDevScopeHint(sessionUser: SessionUser | null | undefined): string {
  if (!sessionUser) {
    return '当前身份：游客；可见范围：public';
  }

  if (sessionUser.role === 'admin') {
    return '当前身份：admin；可见范围：全部已发布（含 password）';
  }

  if (sessionUser.role === 'vip') {
    return '当前身份：vip；可见范围：public/member/vip';
  }

  return '当前身份：member；可见范围：public/member';
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
  const { skin } = useSkin();
  const showDevHint = data.isDev;
  const devScopeHint = getDevScopeHint(data.sessionUser);
  const showVisibility =
    Boolean(data.sessionUser) ||
    data.posts.some((post: PostSummary) => post.visibility !== 'public');

  // Conventional blog pagination: the page scrolls naturally; jump back to the
  // top on each page change so the new page starts at its first post.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on page change, value unused in body on purpose
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0 });
  }, [data.page]);

  if (skin === 'journal') {
    return (
      <JournalBlogList
        data={data}
        showDevHint={showDevHint}
        devScopeHint={devScopeHint}
      />
    );
  }
  return (
    <TerminalBlogList
      data={data}
      showDevHint={showDevHint}
      devScopeHint={devScopeHint}
      showVisibility={showVisibility}
    />
  );
}
