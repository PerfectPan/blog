import { Link } from '@tanstack/react-router';

const FIGLET = `                  __           _                     
 _ __   ___ _ __ / _| ___  ___| |_ _ __   __ _ _ __  
| '_ \\ / _ \\ '__| |_ / _ \\/ __| __| '_ \\ / _\` | '_ \\ 
| |_) |  __/ |  |  _|  __/ (__| |_| |_) | (_| | | | |
| .__/ \\___|_|  |_|  \\___|\\___|\\__| .__/ \\__,_|_| |_|
|_|                               |_|                `;

export function TerminalHomePage() {
  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>whoami --verbose</span>
      </div>
      <div className='th-out'>
        <pre className='th-figlet' aria-hidden='true'>
          {FIGLET}
          <b>.org</b>
        </pre>
      </div>
      <div className='th-home-links'>
        <Link to='/blog'>
          <span className='k'>open blog/</span>
        </Link>
        <Link to='/projects'>
          <span className='k'>open projects/</span>
        </Link>
      </div>
    </div>
  );
}
