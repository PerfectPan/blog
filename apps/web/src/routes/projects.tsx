import { createFileRoute } from '@tanstack/react-router';
import { ProjectsPage } from '../components/projects.js';

export const Route = createFileRoute('/projects')({
  head: () => ({
    meta: [
      { title: "Projects | PerfectPan's Blog" },
      { name: 'description', content: '我的开源项目与作品' },
    ],
  }),
  component: ProjectsPage,
});
