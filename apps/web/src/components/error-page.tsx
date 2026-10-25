import { Link } from '@tanstack/react-router';
import { useT } from '../lib/i18n/context.js';
import { REQUEST_FAILED } from '../lib/i18n/messages.js';
import { Page } from './layout/page';

export function ErrorPage({ error }: { error: unknown }) {
  const t = useT();
  return (
    <Page>
      <div className='flex flex-wrap items-baseline gap-2.5'>
        <span className='text-chart-1'>guest</span>
        <span className='text-muted-foreground/60'>@</span>
        <span className='text-chart-2'>perfectpan.org</span> <span className='text-primary'>~ %</span>{' '}
        <span className='text-foreground hover:text-primary'>curl -I $(hostname)</span>
      </div>
      <p className='mb-1 text-destructive'>{t(REQUEST_FAILED, { error: String(error) })}</p>
      <Link to='/blog' className='text-muted-foreground hover:text-foreground'>
        cd ~/blog
      </Link>
    </Page>
  );
}
