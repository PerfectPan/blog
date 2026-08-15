import { Link } from '@tanstack/react-router';
import { Github, LogOut, Rss, Search, UserRound } from 'lucide-react';
import { authClient } from '../lib/auth-client.js';
import { searchPalette } from './search-palette-store.js';

function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }

  if (role === 'vip') {
    return 'VIP';
  }

  return 'MEMBER';
}

/** Synthwave header: gradient logo + nav with gradient underline. */
export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <header className='g-head'>
      <div className='g-head-in'>
        <Link to='/' className='g-logo'>
          Perfect<b>PAN</b>
        </Link>
        <nav aria-label='主导航'>
          <Link
            to='/'
            activeOptions={{ exact: true }}
            activeProps={{ className: 'on' }}
          >
            Home
          </Link>
          <Link to='/blog' activeProps={{ className: 'on' }}>
            Blog
          </Link>
          <Link to='/projects' activeProps={{ className: 'on' }}>
            Projects
          </Link>
          {sessionUser?.role === 'admin' ? (
            <Link to='/admin' activeProps={{ className: 'on' }}>
              Admin
            </Link>
          ) : null}
        </nav>
        <div className='tools'>
          {sessionUser ? (
            <span className='g-user'>
              <UserRound size={12} aria-hidden='true' />
              <span className='max-w-[180px] truncate'>
                {sessionUser.email}
              </span>
              <span className='g-role'>{getRoleLabel(sessionUser.role)}</span>
            </span>
          ) : null}
          {sessionUser ? (
            <Link to='/logout' className='g-tool' aria-label='Logout'>
              <LogOut size={13} aria-hidden='true' />
            </Link>
          ) : (
            <>
              <Link to='/login' className='g-tool'>
                Login
              </Link>
              <Link to='/signup' className='g-tool'>
                Sign Up
              </Link>
            </>
          )}
          <button
            type='button'
            className='g-tool'
            aria-label='Search (Cmd+K)'
            onClick={() => searchPalette.open()}
          >
            <Search size={13} aria-hidden='true' /> ⌘K
          </button>
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            className='g-tool'
            aria-label='GitHub'
          >
            <Github size={13} aria-hidden='true' />
          </a>
          <a
            href='/rss.xml'
            target='_blank'
            rel='noreferrer'
            className='g-tool'
            aria-label='RSS'
          >
            <Rss size={13} aria-hidden='true' />
          </a>
        </div>
      </div>
    </header>
  );
}
