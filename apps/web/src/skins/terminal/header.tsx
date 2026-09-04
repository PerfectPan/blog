import { Link, useNavigate } from '@tanstack/react-router';
import {
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
import { ConfirmDialog } from '../../components/confirm-dialog.js';
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

/** Terminal title bar: window dots + session name + right-aligned tools.
 *  ≤480px the tool buttons collapse behind a ⋯ toggle that expands a flat
 *  text sheet under the bar (no drawer, no animation — terminals don't slide). */
export function TerminalHeader() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (!toolsOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
      }
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
        <Link to='/'>
          <b>perfectpan@blog</b>
        </Link>
      </span>

      <div className='th-tools'>
        {sessionUser ? (
          <span className='th-user-chip' title={sessionUser.email}>
            <span className='th-user-name'>
              {sessionUser.name || sessionUser.email}
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
            onClick={(event) => {
              event.preventDefault();
              setLogoutOpen(true);
            }}
          >
            <LogOut size={15} aria-hidden='true' />
            <span className='hidden md:inline'>logout</span>
          </Link>
        ) : (
          <>
            <Link to='/login' data-testid='nav-login' className='th-tool-btn'>
              <UserRound size={15} aria-hidden='true' />
              <span className='hidden md:inline'>login</span>
            </Link>
            <Link to='/signup' data-testid='nav-signup' className='th-tool-btn'>
              <UserRoundPlus size={15} aria-hidden='true' />
              <span className='hidden md:inline'>signup</span>
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
          <span className='hidden md:inline'>grep</span>
        </button>
        <a
          href='https://github.com/PerfectPan'
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
          className='th-tool-btn'
        >
          <Github size={15} aria-hidden='true' />
          <span className='hidden md:inline'>github</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label='RSS'
          className='th-tool-btn'
        >
          <Rss size={15} aria-hidden='true' />
          <span className='hidden md:inline'>rss</span>
        </a>
        <button
          type='button'
          className='th-tool-btn th-tools-toggle'
          aria-label={toolsOpen ? 'Close tools menu' : 'Open tools menu'}
          aria-expanded={toolsOpen}
          onClick={() => {
            setToolsOpen(!toolsOpen);
          }}
        >
          {toolsOpen ? (
            <X size={15} aria-hidden='true' />
          ) : (
            <MoreHorizontal size={15} aria-hidden='true' />
          )}
        </button>
      </div>
      {toolsOpen ? (
        // Flat text sheet under the bar; every item closes it as its action
        // (the window-level Escape listener covers Esc as well).
        <div className='th-tools-sheet'>
          {sessionUser ? (
            <button
              type='button'
              onClick={() => {
                setToolsOpen(false);
                setLogoutOpen(true);
              }}
            >
              <LogOut size={14} aria-hidden='true' /> logout
            </button>
          ) : (
            <>
              <Link
                to='/login'
                onClick={() => {
                  setToolsOpen(false);
                }}
              >
                <UserRound size={14} aria-hidden='true' /> login
              </Link>
              <Link
                to='/signup'
                onClick={() => {
                  setToolsOpen(false);
                }}
              >
                <UserRoundPlus size={14} aria-hidden='true' /> signup
              </Link>
            </>
          )}
          <button
            type='button'
            onClick={() => {
              setToolsOpen(false);
              searchPalette.open();
            }}
          >
            <Search size={14} aria-hidden='true' /> grep
          </button>
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            onClick={() => {
              setToolsOpen(false);
            }}
          >
            <Github size={14} aria-hidden='true' /> github
          </a>
          <a
            href='/rss.xml'
            target='_blank'
            rel='noreferrer'
            onClick={() => {
              setToolsOpen(false);
            }}
          >
            <Rss size={14} aria-hidden='true' /> rss
          </a>
        </div>
      ) : null}
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        command='logout'
        description='确定要退出登录吗？退出后需要重新登录。'
        confirmLabel='logout'
        onConfirm={() => {
          setLogoutOpen(false);
          navigate({ to: '/logout' });
        }}
      />
    </header>
  );
}
