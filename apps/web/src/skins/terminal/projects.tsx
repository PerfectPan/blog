import { Link } from '@tanstack/react-router';
import { PROJECTS } from '../../lib/projects.js';
import { sortProjects } from '../shared.js';

export function TerminalProjectsPage() {
  const projects = sortProjects(PROJECTS);

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>ls -la ~/projects</span>
      </div>

      <div className='th-ls mt-3'>
        <div className='th-ls-proj th-ls-proj-head'>
          <span>star</span>
          <span>project</span>
          <span className='text-right'>stack</span>
          <span>link</span>
        </div>
        {projects.map((project) => (
          <div key={project.name} className='th-ls-proj'>
            <span className={project.featured ? 'th-perm-pw' : 'th-comment'}>
              {project.featured ? '★' : ' '}
            </span>
            <span>
              <span className='th-ls-title'>{project.name}</span>
              <span className='th-comment'> — {project.description}</span>
            </span>
            <span className='th-ls-tags text-right'>
              {project.tags.join(' · ')}
            </span>
            <span className='th-ls-link'>
              <a href={project.repo} target='_blank' rel='noreferrer'>
                code ↗
              </a>
              {project.demo ? (
                <>
                  {' '}
                  <a href={project.demo} target='_blank' rel='noreferrer'>
                    demo ↗
                  </a>
                </>
              ) : null}
            </span>
          </div>
        ))}
      </div>

      <div className='th-prompt mt-6'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <Link to='/' className='th-cmd th-cmd-dim'>
          cd ..
        </Link>
      </div>
    </div>
  );
}
