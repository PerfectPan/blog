import { createFileRoute } from '@tanstack/react-router';
import { TerminalHomePage } from '../skins/terminal/home.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  component: HomePage,
});

function HomePage() {
  return <TerminalHomePage />;
}
