import { Link } from '@tanstack/react-router';
import { authClient } from '../../lib/auth-client.js';

const tmuxWin =
  'rounded-[3px] px-2 py-px text-dim hover:text-ink hover:no-underline';

/**
 * tmux-style status bar: session name + clickable windows on the left, site
 * info on the right. Doubles as secondary navigation (the active window is
 * highlighted by the current route).
 */
export function TerminalFooter() {
  const { data: sessionData } = authClient.useSession();
  const isAdmin = sessionData?.user?.role === 'admin';

  return (
    <footer className='flex flex-wrap items-center gap-1 border-t border-line bg-tmux px-3.5 py-1.5 text-[12.5px]'>
      <span className='mr-2 rounded-[3px] bg-green px-2 py-px font-bold text-tmux-ink'>
        blog
      </span>
      <nav aria-label='站点窗口' className='flex flex-wrap items-center gap-1'>
        <Link to='/' className={tmuxWin}>
          0:home
        </Link>
        <Link to='/blog' className={tmuxWin}>
          1:posts
        </Link>
        <Link to='/projects' className={tmuxWin}>
          2:projects
        </Link>
        {isAdmin ? (
          <Link to='/admin' className={tmuxWin}>
            3:admin
          </Link>
        ) : null}
      </nav>
      <span className='ml-auto flex gap-3.5 text-faint'>
        <span>perfectpan.org</span>
        <span className='hidden sm:inline'>⌘K = grep</span>
        <span>© {new Date().getFullYear()}</span>
      </span>
    </footer>
  );
}
