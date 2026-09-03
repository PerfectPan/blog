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

/** Split an email for the prompt-style chip (local@host). */
function splitEmail(email: string): { local: string; host: string } {
  const at = email.indexOf('@');
  if (at < 0) {
    return { local: email, host: '' };
  }
  return { local: email.slice(0, at), host: email.slice(at + 1) };
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
          <b>perfectpan@blog</b>
        </Link>
      </span>

      <div className='th-tools'>
        {sessionUser ? (
          <span className='th-user-chip' title={sessionUser.email}>
            <span className='th-user-email'>
              <span className='u'>{splitEmail(sessionUser.email).local}</span>
              <span className='at'>@</span>
              <span className='h'>{splitEmail(sessionUser.email).host}</span>
            </span>
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
              <span className='hidden sm:inline'>login</span>
            </Link>
            <Link to='/signup' data-testid='nav-signup' className='th-tool-btn'>
              <UserRoundPlus size={15} aria-hidden='true' />
              <span className='hidden sm:inline'>signup</span>
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
          <span className='hidden sm:inline'>github</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label='RSS'
          className='th-tool-btn'
        >
          <Rss size={15} aria-hidden='true' />
          <span className='hidden sm:inline'>rss</span>
        </a>
      </div>
    </header>
  );
}
