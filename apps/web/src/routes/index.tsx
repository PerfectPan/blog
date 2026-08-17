import { createFileRoute } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';
import { readSkinFromCookie, useSkin } from '../skins/context.js';
import { JournalHomePage } from '../skins/journal/home.js';
import { TerminalHomePage } from '../skins/terminal/home.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // The journal home is the only consumer of this data. On the client, skip
    // the query for terminal users. Server-side the loader result caches per
    // isolate, so the query runs at most once either way.
    if (
      !import.meta.env.SSR &&
      readSkinFromCookie(document.cookie) !== 'journal'
    ) {
      return null;
    }
    // Guest-scoped first page powers the journal home's LATEST panel.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function HomePage() {
  const { skin } = useSkin();
  const data = Route.useLoaderData();

  if (skin === 'journal') {
    return <JournalHomePage data={data} />;
  }
  return <TerminalHomePage />;
}
