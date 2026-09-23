import type { PostSummary } from '@blog/shared';
import { Link } from '@tanstack/react-router';
import { Page, Prompt } from './page.js';
import { ENTER_ROW, enterDelay } from './term.js';

// Intro stagger: year headers and rows scroll in top-down after the prompt
// starts typing. Past the cap every line shares the last slot, so a long
// page settles in ~0.6s instead of trickling.
const LIST_DELAY_MS = 120;
const LIST_STAGGER_MS = 25;
const LIST_STAGGER_CAP = 18;
const lineDelay = (line: number) =>
  enterDelay(
    LIST_DELAY_MS + Math.min(line, LIST_STAGGER_CAP) * LIST_STAGGER_MS,
  );

const ROW =
  'grid items-baseline gap-x-3.5 rounded px-2 py-1.25 text-foreground no-underline hover:bg-accent max-[720px]:grid-cols-[7ch_1fr]';

export type BlogListData = {
  posts: PostSummary[];
  total: number;
  page: number;
  totalPages: number;
};

function groupByYear(
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

export function BlogList({
  data,
  showDevHint,
  devScopeHint,
  showVisibility,
}: {
  data: BlogListData;
  showDevHint: boolean;
  devScopeHint: string;
  /** The vis column only earns its space when visibility actually varies
   * (non-public posts exist); for an all-public list it is pure noise. */
  showVisibility: boolean;
}) {
  const blogGroups = groupByYear(data.posts);
  // Stagger slot of the next rendered line (year headers and rows alike).
  let line = 0;

  return (
    <Page>
      <Prompt user='perfectpan' host='blog' cwd='~/posts %' typed>
        ls --group-directories-first
      </Prompt>

      {showDevHint ? (
        <div className='mb-4.5 rounded-lg border border-dashed border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-3.5 py-2 text-xs text-primary mt-4'>
          {devScopeHint}
        </div>
      ) : null}

      <div className='mt-3'>
        {blogGroups.map((group) => (
          <div key={group.year}>
            <div
              className={`mt-5 px-2 py-1.25 font-bold text-primary ${ENTER_ROW}`}
              style={lineDelay(line++)}
            >
              <span className='font-normal text-muted-foreground/60'>
                {'# '}
              </span>
              {group.year}
            </div>
            {group.blogs.map((blog: PostSummary) => (
              <Link
                key={blog.slug}
                to='/blog/$slug'
                params={{ slug: blog.slug }}
                className={`${ROW} ${showVisibility ? 'grid-cols-[7ch_8ch_1fr_auto]' : 'grid-cols-[7ch_1fr_auto]'} ${ENTER_ROW}`}
                style={lineDelay(line++)}
              >
                <span className='text-xs text-muted-foreground'>
                  {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                {showVisibility ? (
                  <span className='text-xs text-muted-foreground/60 max-[720px]:hidden'>
                    {blog.visibility}
                  </span>
                ) : null}
                <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
                  {blog.title}
                </span>
                <span className='text-right text-xs text-muted-foreground/60 max-[720px]:hidden'>
                  {blog.tags.join(' · ')}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {data.totalPages > 1 ? (
        <nav
          className='mt-6.5 flex justify-center gap-4.5 text-sm text-muted-foreground [&_a]:text-primary'
          aria-label='Pagination'
        >
          {data.page > 1 ? (
            <Link to='/blog' search={{ page: data.page - 1 }}>
              ← prev
            </Link>
          ) : (
            <span className='text-muted-foreground/60 opacity-60'>← prev</span>
          )}
          <span>
            page {data.page} / {data.totalPages}
          </span>
          {data.page < data.totalPages ? (
            <Link to='/blog' search={{ page: data.page + 1 }}>
              next →
            </Link>
          ) : (
            <span className='text-muted-foreground/60 opacity-60'>next →</span>
          )}
        </nav>
      ) : null}

      <hr className='my-5 border-0 border-t border-dashed border-border' />
    </Page>
  );
}
