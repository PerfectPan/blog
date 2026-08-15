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
    <div className='z-page'>
      <div className='z-ma' style={{ paddingTop: 56 }} aria-hidden='true'>
        <span>間</span>
      </div>
      <div className='z-label'>器 物</div>
      {projects.map((project) => (
        <div className='z-ware' key={project.name}>
          <div className='name'>
            {project.name}
            {project.featured ? <span className='feat'>代 表 作</span> : null}
          </div>
          <p>{project.description}</p>
          <div className='wlinks'>
            <a href={project.repo} target='_blank' rel='noreferrer'>
              source ↗
            </a>
            {project.demo ? (
              <a href={project.demo} target='_blank' rel='noreferrer'>
                live ↗
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
