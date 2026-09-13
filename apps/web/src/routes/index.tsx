import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '../components/home.js';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: "Home | PerfectPan's Blog" }],
  }),
  component: HomePage,
});
