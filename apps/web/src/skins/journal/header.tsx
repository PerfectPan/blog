import { Link } from '@tanstack/react-router';
import {
  Github,
  LogOut,
  Rss,
  Search,
  Terminal,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';
import { searchPalette } from '../../components/search-palette-store.js';
import { authClient } from '../../lib/auth-client.js';
import { getRoleLabel } from '../../lib/format.js';
import { useSkin } from '../context.js';

/** Journal masthead: warm-paper shell with the site's original wording. */
export function JournalHeader() {
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
        <div className='ml-auto flex items-center gap-2 md:gap-3'>
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
              {/* Phone width only fits the icon; the text label is desktop-only
                  so nav-login / nav-signup testids stay single-element. */}
              <Link
                to='/login'
                data-testid='nav-login'
                aria-label='Login'
                className='text-[13.5px]'
                style={{ letterSpacing: '0.28em', color: 'var(--j-faded)' }}
              >
                <UserRound size={16} className='md:hidden' aria-hidden='true' />
                <span className='hidden md:inline'>Login</span>
              </Link>
              <Link
                to='/signup'
                data-testid='nav-signup'
                aria-label='Sign Up'
                className='text-[13.5px]'
                style={{ letterSpacing: '0.28em', color: 'var(--j-faded)' }}
              >
                <UserRoundPlus
                  size={16}
                  className='md:hidden'
                  aria-hidden='true'
                />
                <span className='hidden md:inline'>Sign Up</span>
              </Link>
            </>
          )}
          <SkinSwitch />
          <button
            type='button'
            aria-label='Search posts (Cmd+K)'
            data-palette-trigger
            onClick={() => searchPalette.toggle()}
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

function SkinSwitch() {
  const { setSkin } = useSkin();
  return (
    <button
      type='button'
      aria-label='Switch to terminal theme'
      onClick={() => setSkin('terminal')}
      style={{
        color: 'var(--j-faint)',
        cursor: 'pointer',
        background: 'none',
        border: 0,
        padding: 0,
      }}
    >
      <Terminal size={16} />
    </button>
  );
}
