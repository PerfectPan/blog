import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { tagColor } from '../lib/post-index.js';
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
    <div className='c-page'>
      <div className='c-list-head'>
        <h1>Projects</h1>
        <span className='count c-no'>
          — {PROJECTS.length} works /{' '}
          {projects.filter((p) => p.featured).length} featured
        </span>
      </div>
      <div className='c-proj'>
        {projects.map((project, index) => (
          <div className='c-proj-row' key={project.name}>
            <div className='idx'>
              {String(index + 1).padStart(2, '0')}
              {project.featured ? <span className='feat'>FEATURED</span> : null}
            </div>
            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
            </div>
            <div className='ptags'>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className='c-chip'
                  style={{ '--c-c': tagColor(tag) } as CSSProperties}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className='plinks'>
              <a href={project.repo} target='_blank' rel='noreferrer'>
                CODE ↗
              </a>
              {project.demo ? (
                <a href={project.demo} target='_blank' rel='noreferrer'>
                  DEMO ↗
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
