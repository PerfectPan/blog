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
    <div className='e-board'>
      <section className='e-sheet'>
        <span className='e-tick tl' aria-hidden='true' />
        <span className='e-tick tr' aria-hidden='true' />
        <span className='e-tick bl' aria-hidden='true' />
        <span className='e-tick br' aria-hidden='true' />
        <div className='e-sheet-head'>
          <span className='dwg'>DWG NO. PP-PRJ-001</span>
          <span className='dwg'>
            REV <span className='rev'>A</span>
          </span>
        </div>

        {projects.map((project, index) => (
          <div className='e-dwg-row' key={project.name}>
            <div className='no'>
              {String(projects.length - index).padStart(2, '0')}
              {project.featured ? <span className='feat'>FEATURED</span> : null}
            </div>
            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
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

        <div className='e-titleblock'>
          <span className='cell'>
            <b>PP-PRJ</b>
          </span>
          <span className='cell'>
            TITLE<b>装配图集</b>
          </span>
          <span className='cell opt'>
            QTY<b>{projects.length}</b>
          </span>
        </div>
      </section>
    </div>
  );
}
