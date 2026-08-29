import { Link } from '@tanstack/react-router';
import {
  BookOpen,
  Github,
  LogOut,
  MoreHorizontal,
  Rss,
  Search,
  UserRound,
  UserRoundPlus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DarkMode } from '../../components/dark-mode.js';
import { searchPalette } from '../../components/search-palette-store.js';
import { authClient } from '../../lib/auth-client.js';
import { getRoleLabel } from '../../lib/format.js';
import { useSkin } from '../context.js';

/** Terminal title bar: window dots + session name + right-aligned tools.
 *  ≤480px the tools collapse behind an ellipsis toggle and expand as a flat
 *  text list under the bar (no drawer/overlay — terminals don't slide). */
export function TerminalHeader() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (!toolsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setToolsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toolsOpen]);

  return (
    <header className='th-titlebar'>
      <span className='th-dot th-dot-r' aria-hidden='true' />
      <span className='th-dot th-dot-y' aria-hidden='true' />
      <span className='th-dot th-dot-g' aria-hidden='true' />
      <span className='th-term-title'>
        <b>perfectpan@blog</b>
        <span className='th-term-sep'> — </span>
        <span className='th-path'>~/perfectpan.org</span>
      </span>

      <div
        id='th-tools-menu'
        role='toolbar'
        aria-label='Site tools'
        className={`th-tools${toolsOpen ? ' th-tools-open' : ''}`}
        // Any action inside the sheet (nav, skin, dark, grep) closes it.
        onClick={() => setToolsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setToolsOpen(false);
        }}
      >
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
            <Link
              to='/login'
              data-testid='nav-login'
              className='th-tool-btn'
              aria-label='Login'
            >
              <UserRound size={15} aria-hidden='true' />
              <span className='hidden sm:inline'>login</span>
            </Link>
            <Link
              to='/signup'
              data-testid='nav-signup'
              className='th-tool-btn'
              aria-label='Sign Up'
            >
              <UserRoundPlus size={15} aria-hidden='true' />
              <span className='hidden sm:inline'>signup</span>
            </Link>
          </>
        )}
        <SkinSwitch />
        <DarkMode />
        <button
          type='button'
          aria-label='Search posts (Cmd+K)'
          data-palette-trigger
          onClick={() => searchPalette.toggle()}
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
          {/* label surfaces only inside the ≤480px tools sheet */}
          <span className='hidden'>github</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label='RSS'
          className='th-tool-btn'
        >
          <Rss size={15} aria-hidden='true' />
          <span className='hidden'>rss</span>
        </a>
      </div>

      <button
        type='button'
        className='th-tool-btn th-menu-btn'
        aria-label='More tools'
        aria-expanded={toolsOpen}
        aria-controls='th-tools-menu'
        onClick={() => setToolsOpen((v) => !v)}
      >
        {toolsOpen ? (
          <X size={15} aria-hidden='true' />
        ) : (
          <MoreHorizontal size={15} aria-hidden='true' />
        )}
      </button>
    </header>
  );
}

function SkinSwitch() {
  const { setSkin } = useSkin();
  return (
    <button
      type='button'
      className='th-tool-btn'
      aria-label='Switch to journal theme'
      onClick={() => setSkin('journal')}
    >
      <BookOpen size={15} aria-hidden='true' />
      <span className='hidden sm:inline'>journal</span>
    </button>
  );
}
