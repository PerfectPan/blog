import { createFileRoute } from '@tanstack/react-router';
import { getBlogListServerFn } from '../lib/blog-service.js';
import { TerminalHomePage } from '../skins/terminal/home.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  loader: async () => {
    // Guest-scoped first page powers the journal home's LATEST panel.
    return getBlogListServerFn({ data: { page: 1 } });
  },
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();

  return <TerminalHomePage />;
}
