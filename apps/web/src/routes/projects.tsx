import { createFileRoute } from '@tanstack/react-router';
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
    <div className='j-sheet'>
      <h1 className='j-entry-title text-center'>Projects</h1>
      <p className='j-entry-meta text-center'>我做过的一些东西，按需更新。</p>

      {projects.map((project, index) => (
        <div className='j-ware' key={project.name}>
          <div className='no'>
            {String(index + 1).padStart(2, '0')}
            {project.featured ? <small>FEATURED</small> : null}
          </div>
          <div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className='tags'>{project.tags.join('　')}</div>
            <div className='wlinks'>
              <a href={project.repo} target='_blank' rel='noreferrer'>
                Code ↗
              </a>
              {project.demo ? (
                <a href={project.demo} target='_blank' rel='noreferrer'>
                  Demo ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
