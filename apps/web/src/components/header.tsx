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

/** Zen header: journal mark + minimal nav + tools. Light-only theme. */
export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <div>
      <header className='z-head'>
        <Link to='/' className='mark'>
          字纸篓
        </Link>
        <nav aria-label='主导航'>
          <Link to='/blog'>读</Link>
          <Link to='/projects'>物</Link>
          {sessionUser?.role === 'admin' ? <Link to='/admin'>理</Link> : null}
        </nav>
        <div className='z-tools ml-auto'>
          {sessionUser ? (
            <span className='z-user'>
              <UserRound size={12} aria-hidden='true' />
              <span className='max-w-[160px] truncate'>
                {sessionUser.email}
              </span>
              <span
                style={{
                  border: '1px solid var(--z-line)',
                  borderRadius: 8,
                  padding: '0 6px',
                  fontSize: 9.5,
                  letterSpacing: '0.12em',
                }}
              >
                {getRoleLabel(sessionUser.role)}
              </span>
            </span>
          ) : null}
          {sessionUser ? (
            <Link to='/logout' data-testid='nav-logout' aria-label='Logout'>
              <LogOut size={15} />
            </Link>
          ) : (
            <Link to='/login' data-testid='nav-login'>
              入
            </Link>
          )}
          <button
            type='button'
            aria-label='検索 (Cmd+K)'
            onClick={() => searchPalette.open()}
          >
            <Search size={15} />
          </button>
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            aria-label='GitHub'
          >
            <Github size={15} />
          </a>
          <a href='/rss.xml' target='_blank' rel='noreferrer' aria-label='RSS'>
            <Rss size={15} />
          </a>
        </div>
      </header>
      <aside className='z-margin-note' aria-hidden='true'>
        字纸篓 ・ PERFECTPAN ・ 静々と更新中
      </aside>
    </div>
  );
}
