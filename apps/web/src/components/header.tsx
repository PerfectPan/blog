import { Link } from '@tanstack/react-router';
import { Github, LogOut, Rss, Search, UserRound } from 'lucide-react';
import { authClient } from '../lib/auth-client.js';
import { DarkMode } from './dark-mode.js';
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

/** Swiss keyline header: logo + nav with active underline + tools. */
export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <header className='c-head'>
      <div className='c-head-in'>
        <Link to='/' className='c-logo'>
          PERFECTPAN
          <span className='cursor' aria-hidden='true' />
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
        <div className='c-tools'>
          {sessionUser ? (
            <span className='c-user'>
              <UserRound size={13} aria-hidden='true' />
              <span className='max-w-[180px] truncate'>
                {sessionUser.email}
              </span>
              <span className='c-role'>{getRoleLabel(sessionUser.role)}</span>
            </span>
          ) : null}
          {sessionUser ? (
            <Link
              to='/logout'
              data-testid='nav-logout'
              className='c-tool'
              aria-label='Logout'
            >
              <LogOut size={15} aria-hidden='true' />
            </Link>
          ) : (
            <>
              <Link to='/login' data-testid='nav-login' className='c-tool'>
                Login
              </Link>
              <Link to='/signup' data-testid='nav-signup' className='c-tool'>
                Sign Up
              </Link>
            </>
          )}
          <button
            type='button'
            aria-label='Search posts (Cmd+K)'
            onClick={() => searchPalette.open()}
            className='c-tool'
          >
            <Search size={15} aria-hidden='true' />
          </button>
          <DarkMode />
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub'
            className='c-tool'
          >
            <Github size={15} aria-hidden='true' />
          </a>
          <a
            href='/rss.xml'
            target='_blank'
            rel='noreferrer'
            aria-label='RSS'
            className='c-tool'
          >
            <Rss size={15} aria-hidden='true' />
          </a>
        </div>
      </div>
    </header>
  );
}
