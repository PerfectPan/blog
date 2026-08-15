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

const CN_ORDINALS = [
  '壹',
  '贰',
  '叁',
  '肆',
  '伍',
  '陆',
  '柒',
  '捌',
  '玖',
  '拾',
];

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
      <h1 className='j-entry-title text-center'>器物谱</h1>
      <p className='j-entry-meta text-center'>所制之器 · 自兹编次 · 以志不忘</p>

      {projects.map((project, index) => (
        <div className='j-ware' key={project.name}>
          <div className='no'>
            {CN_ORDINALS[index] ?? index + 1}
            {project.featured ? <small>FEATURED</small> : null}
          </div>
          <div>
            <h2>
              {project.name}
              {project.featured ? <span className='feat'>精选</span> : null}
            </h2>
            <p>{project.description}</p>
            <div className='tags'>{project.tags.join('　')}</div>
            <div className='wlinks'>
              <a href={project.repo} target='_blank' rel='noreferrer'>
                源码 ↗
              </a>
              {project.demo ? (
                <a href={project.demo} target='_blank' rel='noreferrer'>
                  在线 ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
