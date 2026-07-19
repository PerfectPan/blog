import { createFileRoute, Link } from '@tanstack/react-router';
import { ExternalLink, Github } from 'lucide-react';
import { PROJECTS, type Project } from '../lib/projects.js';

export const Route = createFileRoute('/projects')({
  head: () => ({
    meta: [
      { title: "Projects | PerfectPan's Blog" },
      { name: 'description', content: '我的开源项目与作品' },
    ],
  }),
  component: ProjectsPage,
});

function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    if (Boolean(a.featured) === Boolean(b.featured)) {
      return a.name.localeCompare(b.name);
    }
    return a.featured ? -1 : 1;
  });
}

function ProjectsPage() {
  const projects = sortProjects(PROJECTS);

  return (
    <div className='mx-auto w-full self-start max-w-[80ch] pt-24 lg:pt-32'>
      <h1 className='mb-2 text-3xl font-black'>Projects</h1>
      <p className='mb-8 opacity-70'>我做过的一些东西，按需更新。</p>

      <div className='grid gap-4 sm:grid-cols-2'>
        {projects.map((project) => (
          <article
            key={project.name}
            className='flex flex-col rounded-lg border border-slate-200 bg-white/60 p-5 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-wash-dark'
          >
            <div className='mb-1 flex items-center gap-2'>
              <h2 className='text-lg font-semibold'>{project.name}</h2>
              {project.featured ? (
                <span className='rounded-full bg-black px-2 py-[2px] text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900'>
                  FEATURED
                </span>
              ) : null}
            </div>
            <p className='mb-4 flex-grow text-sm opacity-70'>
              {project.description}
            </p>
            <div className='mb-4 flex flex-wrap gap-1.5'>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-md border border-slate-200 px-2 py-[2px] text-[11px] opacity-70 dark:border-slate-700'
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className='flex items-center gap-4 text-sm'>
              <a
                href={project.repo}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-1 opacity-70 hover:opacity-100'
              >
                <Github size={15} />
                Code
              </a>
              {project.demo ? (
                <a
                  href={project.demo}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center gap-1 opacity-70 hover:opacity-100'
                >
                  <ExternalLink size={15} />
                  Demo
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <Link to='/' className='mt-8 inline-block'>
        <span className='opacity-70'>&gt;&nbsp;&nbsp;&nbsp;</span>
        <span className='underline opacity-70 hover:opacity-100'>cd ..</span>
      </Link>
    </div>
  );
}
