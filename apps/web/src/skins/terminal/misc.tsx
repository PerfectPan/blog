import { Link } from '@tanstack/react-router';

export function TerminalNotFound() {
  return (
    <div className='th-page'>
      <div className='nf'>
        <div className='th-prompt'>
          <span className='th-prompt-u'>guest</span>
          <span className='th-prompt-at'>@</span>
          <span className='th-prompt-h'>perfectpan.org</span>{' '}
          <span className='th-prompt-p'>~ %</span>{' '}
          <span className='th-cmd'>cd /nowhere</span>
        </div>
        <p className='th-out th-nf-big'>
          bash: cd: /nowhere: No such file or directory
        </p>
        <p className='th-out th-comment'># 你闯入了无人之境。</p>
        <p className='th-out mt-4'>
          <Link to='/blog' className='th-cd'>
            cd ~/blog
          </Link>
          <span className='th-comment'> ← 回到博客列表</span>
        </p>
      </div>
    </div>
  );
}

export function TerminalError({ error }: { error: unknown }) {
  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>curl -I $(hostname)</span>
      </div>
      <p className='th-out th-nf-big'>Request failed: {String(error)}</p>
      <Link to='/blog' className='th-cd'>
        cd ~/blog
      </Link>
    </div>
  );
}
