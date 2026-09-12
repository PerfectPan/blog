import { createFileRoute } from '@tanstack/react-router';
import { TerminalProjectsPage } from '../skins/terminal/projects.js';

export const Route = createFileRoute('/projects')({
  head: () => ({
    meta: [
      { title: "Projects | PerfectPan's Blog" },
      { name: 'description', content: '我的开源项目与作品' },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return <TerminalProjectsPage />;
}
