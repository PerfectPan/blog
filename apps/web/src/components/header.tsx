import { Link } from '@tanstack/react-router';
import { Github, LogOut, Rss, UserRound } from 'lucide-react';
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

/** Blueprint drawing-index bar: DWG no + nav + tools. Dark-native theme. */
export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <header className='e-head'>
      <span className='dwg'>
        DWG NO. <b>PP-NAV-000</b> · REV <b>C</b>
      </span>
      <nav aria-label='图纸目录'>
        <Link
          to='/'
          activeOptions={{ exact: true }}
          activeProps={{ className: 'on' }}
        >
          COVER
        </Link>
        <Link to='/blog' activeProps={{ className: 'on' }}>
          BLOG
        </Link>
        <Link to='/projects' activeProps={{ className: 'on' }}>
          PROJECTS
        </Link>
        {sessionUser?.role === 'admin' ? (
          <Link to='/admin' activeProps={{ className: 'on' }}>
            ADMIN
          </Link>
        ) : null}
      </nav>
      <div className='tools'>
        {sessionUser ? (
          <span className='e-user'>
            <UserRound size={12} aria-hidden='true' />
            <span className='max-w-[180px] truncate'>{sessionUser.email}</span>
            <span className='e-role'>{getRoleLabel(sessionUser.role)}</span>
          </span>
        ) : null}
        {sessionUser ? (
          <Link to='/logout' className='e-tool' aria-label='Logout'>
            <LogOut size={12} aria-hidden='true' />
          </Link>
        ) : (
          <>
            <Link to='/login' className='e-tool'>
              SIGN IN
            </Link>
            <Link to='/signup' className='e-tool'>
              SIGN UP
            </Link>
          </>
        )}
        <button
          type='button'
          className='e-tool'
          aria-label='检索 (Cmd+K)'
          onClick={() => searchPalette.open()}
        >
          ⌘K
        </button>
        <a
          href='https://github.com/PerfectPan'
          target='_blank'
          rel='noreferrer'
          className='e-tool'
          aria-label='GitHub'
        >
          <Github size={12} aria-hidden='true' />
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          className='e-tool'
          aria-label='RSS'
        >
          <Rss size={12} aria-hidden='true' />
        </a>
      </div>
    </header>
  );
}
