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
    <div className='g-page'>
      <div className='g-list-head'>
        <h1>Projects</h1>
        <span className='g-cnt'>— {PROJECTS.length} WORKS</span>
      </div>
      <div className='g-proj-grid'>
        {projects.map((project) => (
          <div className='g-panel g-proj-card' key={project.name}>
            <h2>
              {project.name}
              {project.featured ? <span className='feat'>FEATURED</span> : null}
            </h2>
            <p>{project.description}</p>
            <div className='tags'>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className='g-chip'
                  style={{ color: tagColor(tag), borderColor: tagColor(tag) }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className='links'>
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
