import { Link } from '@tanstack/react-router';

const FIGLET = `  ____              _   _        _   ____  __  __ ____
 |  _ \\ _   _  __ _| |_| |__    / \\ |  _ \\|  \\/  |  _ \\
 | |_) | | | |/ _\` | __| '_ \\  / _ \\| |_) | |\\/| | |_) |
 |  __/| |_| | (_| | |_| | | |/ ___ \\  __/| |  | |  __/
 |_|    \\__,_|\\__,_|\\__|_| |_/_/   \\_\\_|  |_|  |_|_|   `;

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
        <div className='th-hero-name'>PerfectPan</div>
        <pre className='th-figlet' aria-hidden='true'>
          {FIGLET}
          <b>.dev</b>
        </pre>
      </div>
      <div className='th-prompt mt-6'>
        <span className='th-prompt-u'>perfectpan</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>blog</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>cat motd.txt</span>
      </div>
      <p className='th-out th-comment'>
        # 是个什么都不会的废物.jpg —— 但还在写。
      </p>
      <div className='th-home-links'>
        <Link to='/blog'>
          <span className='k'>open blog/</span>
          <small>算法 / TypeScript / 随笔</small>
        </Link>
        <Link to='/projects'>
          <span className='k'>open projects/</span>
          <small>Rust / TS / Moonbit 开源项目</small>
        </Link>
      </div>
    </div>
  );
}
