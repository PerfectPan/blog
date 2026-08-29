import { Link } from '@tanstack/react-router';
import { Page, Prompt } from './prompt.js';

export function TerminalNotFound() {
  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org'>
        cd /nowhere
      </Prompt>
      <p className='my-1 text-red'>
        bash: cd: /nowhere: No such file or directory
      </p>
      <p className='my-1 text-faint'># 你闯入了无人之境。</p>
      <p className='my-1 mt-4'>
        <Link to='/blog' className='text-dim hover:text-ink hover:no-underline'>
          cd ~/blog
        </Link>
        <span className='text-faint'> ← 回到博客列表</span>
      </p>
    </Page>
  );
}

export function TerminalError({ error }: { error: unknown }) {
  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org'>
        curl -I $(hostname)
      </Prompt>
      <p className='my-1 text-red'>Request failed: {String(error)}</p>
      <Link to='/blog' className='text-dim hover:text-ink hover:no-underline'>
        cd ~/blog
      </Link>
    </Page>
  );
}
