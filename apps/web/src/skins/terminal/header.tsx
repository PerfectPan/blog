import { Link } from '@tanstack/react-router';
import {
  Github,
  LogOut,
  Rss,
  Search,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';
import { DarkMode } from '../../components/dark-mode.js';
import { searchPalette } from '../../components/search-palette-store.js';
import { authClient } from '../../lib/auth-client.js';

function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }

  if (role === 'vip') {
    return 'VIP';
  }

  return 'MEMBER';
}

/** Terminal title bar: window dots + session name + right-aligned tools. */
export function TerminalHeader() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <header className='th-titlebar'>
      <span className='th-dot th-dot-r' aria-hidden='true' />
      <span className='th-dot th-dot-y' aria-hidden='true' />
      <span className='th-dot th-dot-g' aria-hidden='true' />
      <span className='th-term-title'>
        <Link to='/' className='th-home-link'>
          <b>perfectpan@blog</b> —{' '}
          <span className='th-path'>~/perfectpan.org</span>
        </Link>
      </span>

      <div className='th-tools'>
        {sessionUser ? (
          <span className='th-user-chip'>
            <UserRound size={13} aria-hidden='true' />
            <span className='max-w-[220px] truncate'>{sessionUser.email}</span>
            <span className='th-role-badge'>
              {getRoleLabel(sessionUser.role)}
            </span>
          </span>
        ) : null}
        {sessionUser ? (
          <Link
            to='/logout'
            data-testid='nav-logout'
            className='th-tool-btn'
            aria-label='Logout'
          >
            <LogOut size={15} aria-hidden='true' />
            <span className='hidden sm:inline'>logout</span>
          </Link>
        ) : (
          <>
            <Link to='/login' data-testid='nav-login' className='th-tool-btn'>
              <UserRound size={15} aria-hidden='true' />
              login
            </Link>
            <Link to='/signup' data-testid='nav-signup' className='th-tool-btn'>
              <UserRoundPlus size={15} aria-hidden='true' />
              signup
            </Link>
          </>
        )}
        <DarkMode />
        <button
          type='button'
          aria-label='Search posts (Cmd+K)'
          onClick={() => searchPalette.open()}
          className='th-tool-btn'
        >
          <Search size={15} aria-hidden='true' />
          <span className='hidden sm:inline'>grep</span>
        </button>
        <a
          href='https://github.com/PerfectPan'
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
          className='th-tool-btn'
        >
          <Github size={15} aria-hidden='true' />
          <span>github</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label='RSS'
          className='th-tool-btn'
        >
          <Rss size={15} aria-hidden='true' />
          <span>rss</span>
        </a>
      </div>
    </header>
  );
}
