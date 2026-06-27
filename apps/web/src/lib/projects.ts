export type Project = {
  /** Display name of the project. */
  name: string;
  /** One-line description shown under the title. */
  description: string;
  /** Primary tech stack / tags. */
  tags: string[];
  /** Source repository URL. */
  repo: string;
  /** Optional live demo / homepage URL. */
  demo?: string;
  /** Mark a couple of projects as featured to pin them to the top. */
  featured?: boolean;
};

/**
 * Curated list of personal projects shown on `/projects`.
 *
 * This is intentionally hardcoded (no GitHub API, no CMS): editing this file
 * and pushing is the entire workflow for adding/removing a project.
 */
export const PROJECTS: Project[] = [
  {
    name: 'blog',
    description:
      '本博客 —— TanStack Start 前台，全量部署在 Cloudflare Workers + D1 上。',
    tags: ['TanStack Start', 'Cloudflare', 'TypeScript'],
    repo: 'https://github.com/PerfectPan/blog',
    demo: 'https://github.com/PerfectPan',
    featured: true,
  },
];
