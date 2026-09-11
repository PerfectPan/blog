import { Link } from '@tanstack/react-router';
import { PROJECTS, sortProjects } from '../../lib/projects.js';
import { Page } from './page.js';

export function TerminalProjectsPage() {
  const projects = sortProjects(PROJECTS);

  return (
    <Page>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~/projects</span>
      </div>

      <div className='th-proj-list'>
        {projects.map((project) => (
          <div key={project.name} className='th-proj-card'>
            <div className='th-proj-top'>
              <span className='th-proj-name'>{project.name}</span>
              <span className='th-proj-links'>
                <a href={project.repo} target='_blank' rel='noreferrer'>
                  code ↗
                </a>
                {project.demo ? (
                  <a href={project.demo} target='_blank' rel='noreferrer'>
                    {project.demoLabel ?? 'demo'} ↗
                  </a>
                ) : null}
              </span>
            </div>
            <p className='th-proj-desc'>{project.description}</p>
            <div className='th-proj-tags'>{project.tags.join(' · ')}</div>
          </div>
        ))}
      </div>
    </Page>
  );
}
