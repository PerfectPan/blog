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

/** Journal masthead: warm-paper shell with the site's original wording. */
export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <div>
      <header className='j-masthead'>
        <div className='j-brand'>
          <Link to='/'>
            PerfectPan<span className='j-dot'>.</span>
          </Link>
        </div>
        <nav aria-label='主导航'>
          <Link to='/'>Home</Link>
          <Link to='/blog'>Blog</Link>
          <Link to='/projects'>Projects</Link>
          {sessionUser?.role === 'admin' ? (
            <Link to='/admin'>Admin</Link>
          ) : null}
        </nav>
        <div className='ml-auto flex items-center gap-3'>
          {sessionUser ? (
            <span className='j-user-chip hidden md:flex'>
              <UserRound size={13} aria-hidden='true' />
              <span className='max-w-[200px] truncate'>
                {sessionUser.email}
              </span>
              <span className='j-user-role'>
                {getRoleLabel(sessionUser.role)}
              </span>
            </span>
          ) : null}
          {sessionUser ? (
            <Link to='/logout' data-testid='nav-logout' aria-label='Logout'>
              <LogOut size={17} className='opacity-60 hover:opacity-100' />
            </Link>
          ) : (
            <>
              <Link
                to='/login'
                data-testid='nav-login'
                className='text-[13.5px]'
                style={{ letterSpacing: '0.28em', color: 'var(--j-faded)' }}
              >
                Login
              </Link>
              <Link
                to='/signup'
                className='text-[13.5px]'
                style={{ letterSpacing: '0.28em', color: 'var(--j-faded)' }}
              >
                Sign Up
              </Link>
            </>
          )}
          <button
            type='button'
            aria-label='Search posts (Cmd+K)'
            onClick={() => searchPalette.open()}
          >
            <Search size={17} className='opacity-60 hover:opacity-100' />
          </button>
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub'
          >
            <Github size={17} className='opacity-60 hover:opacity-100' />
          </a>
          <a href='/rss.xml' target='_blank' rel='noreferrer' aria-label='RSS'>
            <Rss size={17} className='opacity-60 hover:opacity-100' />
          </a>
        </div>
      </header>
      <div className='j-headrule'>
        <hr />
      </div>
    </div>
  );
}
