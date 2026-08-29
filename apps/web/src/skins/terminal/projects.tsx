import { Link } from '@tanstack/react-router';
import { PROJECTS, sortProjects } from '../../lib/projects.js';
import { Page, Prompt } from './prompt.js';

const projRow =
  'grid grid-cols-[4ch_1fr_18ch_auto] items-baseline gap-x-4 rounded p-2 max-[720px]:grid-cols-[4ch_1fr] max-[720px]:[&_.th-ls-tags]:hidden max-[720px]:[&_.th-ls-link]:hidden';

export function TerminalProjectsPage() {
  const projects = sortProjects(PROJECTS);

  return (
    <Page>
      <Prompt>ls -la ~/projects</Prompt>

      <div className='mt-3'>
        <div className={`${projRow} text-[12.5px] text-faint`}>
          <span>star</span>
          <span>project</span>
          <span className='text-right'>stack</span>
          <span>link</span>
        </div>
        {projects.map((project) => (
          <div key={project.name} className={projRow}>
            <span className={project.featured ? 'text-red' : 'text-faint'}>
              {project.featured ? '★' : ' '}
            </span>
            <span>
              <span className='truncate'>{project.name}</span>
              <span className='text-faint'> — {project.description}</span>
            </span>
            <span className='text-right text-[12.5px] text-faint'>
              {project.tags.join(' · ')}
            </span>
            <span className='flex gap-2'>
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

      <Prompt className='mt-6'>
        <Link to='/' className='text-dim hover:text-ink hover:no-underline'>
          {' '}
          cd ..{' '}
        </Link>
      </Prompt>
    </Page>
  );
}
