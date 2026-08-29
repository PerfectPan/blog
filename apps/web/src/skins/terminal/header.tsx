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

const toolBtn =
  'inline-flex cursor-pointer items-center gap-1 rounded border-0 bg-none px-2 py-1 text-[13px] text-dim hover:text-amber hover:no-underline';
const toolLabel = 'hidden sm:inline max-[480px]:inline';
const labelOnly = 'hidden max-[480px]:inline';

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

  const toolsCls = [
    'ml-auto flex items-center gap-1.5',
    // ≤480px: flat expanding sheet under the bar — no drawer, no motion.
    'max-[480px]:flex-col max-[480px]:items-stretch',
    toolsOpen
      ? 'max-[480px]:absolute max-[480px]:inset-x-0 max-[480px]:top-full max-[480px]:z-40 max-[480px]:gap-px max-[480px]:border-b max-[480px]:border-line max-[480px]:bg-[linear-gradient(var(--t-titlebar-a),var(--t-titlebar-b))] max-[480px]:px-2.5 max-[480px]:pb-2.5 max-[480px]:pt-1 max-[480px]:shadow-[0_10px_22px_rgba(0,0,0,0.28)] max-[480px]:[&>*]:rounded-none max-[480px]:[&>*]:px-2.5 max-[480px]:[&>*]:py-2 max-[480px]:[&>*]:justify-start'
      : 'max-[480px]:hidden',
  ].join(' ');

  return (
    <header className='relative flex items-center gap-2 border-b border-line bg-[linear-gradient(var(--t-titlebar-a),var(--t-titlebar-b))] px-[18px] py-2.5 max-[640px]:gap-[5px] max-[640px]:px-3 max-[640px]:py-2'>
      <span
        className='h-[11px] w-[11px] rounded-full bg-[#e5544b]'
        aria-hidden='true'
      />
      <span
        className='h-[11px] w-[11px] rounded-full bg-[#d8a03c]'
        aria-hidden='true'
      />
      <span
        className='h-[11px] w-[11px] rounded-full bg-[#47a258]'
        aria-hidden='true'
      />
      <span className='ml-2.5 text-[12.5px] text-dim max-[640px]:ml-1.5 max-[640px]:min-w-0 max-[640px]:flex-1 max-[640px]:truncate'>
        <b className='font-semibold text-ink'>perfectpan@blog</b>
        <span className='max-[640px]:hidden'> — </span>
        <span className='text-cyan max-[640px]:hidden'>~/perfectpan.org</span>
      </span>

      <div
        id='th-tools-menu'
        role='toolbar'
        aria-label='Site tools'
        className={`${toolsCls} max-[480px]:[&_span.hidden]:inline`}
        // Any action inside the sheet (nav, skin, dark, grep) closes it.
        onClick={() => setToolsOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setToolsOpen(false);
        }}
      >
        {sessionUser ? (
          <span className='hidden items-center gap-2 rounded-full border border-line px-2.5 py-0.5 text-xs text-dim md:inline-flex'>
            <UserRound size={13} aria-hidden='true' />
            <span className='max-w-[220px] truncate'>{sessionUser.email}</span>
            <span className='rounded-full bg-amber px-[7px] py-px text-[10px] font-bold text-amber-ink'>
              {getRoleLabel(sessionUser.role)}
            </span>
          </span>
        ) : null}
        {sessionUser ? (
          <Link
            to='/logout'
            data-testid='nav-logout'
            className={toolBtn}
            aria-label='Logout'
          >
            <LogOut size={15} aria-hidden='true' />
            <span className={toolLabel}>logout</span>
          </Link>
        ) : (
          <>
            <Link
              to='/login'
              data-testid='nav-login'
              className={toolBtn}
              aria-label='Login'
            >
              <UserRound size={15} aria-hidden='true' />
              <span className={toolLabel}>login</span>
            </Link>
            <Link
              to='/signup'
              data-testid='nav-signup'
              className={toolBtn}
              aria-label='Sign Up'
            >
              <UserRoundPlus size={15} aria-hidden='true' />
              <span className={toolLabel}>signup</span>
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
          className={toolBtn}
        >
          <Search size={15} aria-hidden='true' />
          <span className={toolLabel}>grep</span>
        </button>
        <a
          href='https://github.com/PerfectPan'
          target='_blank'
          rel='noreferrer'
          aria-label='GitHub'
          className={toolBtn}
        >
          <Github size={15} aria-hidden='true' />
          <span className={labelOnly}>github</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label='RSS'
          className={toolBtn}
        >
          <Rss size={15} aria-hidden='true' />
          <span className={labelOnly}>rss</span>
        </a>
      </div>

      <button
        type='button'
        aria-label='More tools'
        aria-expanded={toolsOpen}
        aria-controls='th-tools-menu'
        onClick={() => setToolsOpen((v) => !v)}
        className='ml-auto hidden cursor-pointer items-center rounded border-0 bg-none p-1 text-dim hover:text-amber max-[480px]:inline-flex'
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
      className={toolBtn}
      aria-label='Switch to journal theme'
      onClick={() => setSkin('journal')}
    >
      <BookOpen size={15} aria-hidden='true' />
      <span className={toolLabel}>journal</span>
    </button>
  );
}
