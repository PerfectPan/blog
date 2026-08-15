import { createFileRoute } from '@tanstack/react-router';
import { PROJECTS, type Project } from '../lib/projects.js';
import { tagColor } from '../lib/tag-color.js';

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
    <div className='f-page'>
      <div className='f-page-head'>
        <span className='f-banner'>PROJECTS</span>
        <h1>项目</h1>
      </div>
      <div className='f-proj-grid'>
        {projects.map((project) => (
          <div className='f-card f-lift f-proj-card' key={project.name}>
            <h2>
              {project.name}
              {project.featured ? (
                <span
                  className='f-sticker'
                  style={{ background: '#FFDE59', transform: 'rotate(2deg)' }}
                >
                  ★ FEATURED
                </span>
              ) : null}
            </h2>
            <p>{project.description}</p>
            <div className='tags'>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className='f-sticker'
                  style={{ background: tagColor(tag) }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className='links'>
              <a
                className='f-btn'
                href={project.repo}
                target='_blank'
                rel='noreferrer'
              >
                CODE ↗
              </a>
              {project.demo ? (
                <a
                  className='f-btn f-btn-o'
                  href={project.demo}
                  target='_blank'
                  rel='noreferrer'
                >
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
