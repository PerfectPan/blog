import { Link } from '@tanstack/react-router';
import { useMisc } from '../lib/i18n/messages/index.js';
import { Page } from './page.js';

export function NotFoundPage() {
  const t = useMisc();
  return (
    <Page>
      <div>
        <div className='flex flex-wrap items-baseline gap-2.5'>
          <span className='text-chart-1'>guest</span>
          <span className='text-muted-foreground/60'>@</span>
          <span className='text-chart-2'>perfectpan.org</span>{' '}
          <span className='text-primary'>~ %</span>{' '}
          <span className='text-foreground hover:text-primary'>
            cd /nowhere
          </span>
        </div>
        <p className='mb-1 text-destructive'>
          bash: cd: /nowhere: No such file or directory
        </p>
        <p className='mb-1 text-muted-foreground/60'>{t.notFoundComment}</p>
        <p className='mb-1 mt-4'>
          <Link
            to='/blog'
            className='text-muted-foreground hover:text-foreground'
          >
            cd ~/blog
          </Link>
          <span className='text-muted-foreground/60'> {t.backToBlogList}</span>
        </p>
      </div>
    </Page>
  );
}

export function ErrorPage({ error }: { error: unknown }) {
  const t = useMisc();
  return (
    <Page>
      <div className='flex flex-wrap items-baseline gap-2.5'>
        <span className='text-chart-1'>guest</span>
        <span className='text-muted-foreground/60'>@</span>
        <span className='text-chart-2'>perfectpan.org</span>{' '}
        <span className='text-primary'>~ %</span>{' '}
        <span className='text-foreground hover:text-primary'>
          curl -I $(hostname)
        </span>
      </div>
      <p className='mb-1 text-destructive'>{t.requestFailed(String(error))}</p>
      <Link to='/blog' className='text-muted-foreground hover:text-foreground'>
        cd ~/blog
      </Link>
    </Page>
  );
}
