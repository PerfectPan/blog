import { Link } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client.js';

/**
 * tmux-style status bar: session name + clickable windows on the left, site
 * info on the right. Doubles as secondary navigation (the active window is
 * highlighted by the current route).
 */
export function TerminalFooter() {
  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === 'admin';

  return (
    <footer className='th-tmux'>
      <span className='th-tmux-sess'>blog</span>
      <nav aria-label='站点窗口' className='flex flex-wrap items-center gap-1'>
        <Link to='/' className='th-tmux-win'>
          0:home
        </Link>
        <Link to='/blog' className='th-tmux-win'>
          1:posts
        </Link>
        <Link to='/projects' className='th-tmux-win'>
          2:projects
        </Link>
        {isAdmin ? (
          <Link to='/admin' className='th-tmux-win'>
            3:admin
          </Link>
        ) : null}
      </nav>
      <span className='th-tmux-right'>
        <span>perfectpan.org</span>
        <span className='hidden sm:inline'>⌘K = grep</span>
        <span>© {new Date().getFullYear()}</span>
      </span>
    </footer>
  );
}
