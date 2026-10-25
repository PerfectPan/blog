import type { Locale } from '@blog/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import { Languages, LogOut, MoreHorizontal, Rss, Search, UserRound, UserRoundPlus, X } from 'lucide-react';
import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { useLocale, useT } from '../lib/i18n/context.js';
import {
  CLOSE_TOOLS_MENU,
  GITHUB_ARIA,
  GITHUB_LABEL,
  LANG_EN_NAME,
  LANG_ZH_NAME,
  LOGOUT_ARIA,
  LOGOUT_CONFIRM_DESCRIPTION,
  NAV_LOGIN,
  NAV_LOGOUT,
  NAV_SIGNUP,
  OPEN_TOOLS_MENU,
  RSS_ARIA,
  RSS_LABEL,
  SEARCH_ARIA,
  SEARCH_TOOL,
  SWITCH_LOCALE
} from '../lib/i18n/messages.js';
import { useSessionUser } from '../lib/session-user.js';
import { DarkMode } from './dark-mode.js';
import { searchPalette } from './search-palette-store.js';
import { SHEET_ROW, TOOL_BTN, TOOL_BTN_TOGGLE } from './term.js';

// The logout confirm dialog (radix Dialog) loads in its own chunk, mounted
// on first use, so radix stays out of the logged-out pages' critical path.
const ConfirmDialog = lazy(() => import('./confirm-dialog.js').then((m) => ({ default: m.ConfirmDialog })));

// lucide-react 1.x dropped brand icons; render the GitHub mark directly.
function GithubMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
    </svg>
  );
}

function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }

  if (role === 'vip') {
    return 'VIP';
  }

  return 'MEMBER';
}

/**
 * Language switcher. Follows the theme-toggle anatomy (icon + label) and
 * shows the target locale in its own name — English / 中文 — the standard
 * convention for language switchers. Same control in the desktop bar and
 * the ≤480px sheet.
 */
function LocaleSwitcher({ variant }: { variant: 'bar' | 'sheet' }) {
  const { locale, setLocale } = useLocale();
  const t = useT();
  const next: Locale = locale === 'zh' ? 'en' : 'zh';
  const label = next === 'zh' ? t(LANG_ZH_NAME) : t(LANG_EN_NAME);
  const ariaLabel = t(SWITCH_LOCALE, { name: label });

  if (variant === 'sheet') {
    return (
      <button type='button' aria-label={ariaLabel} onClick={() => setLocale(next)} className={SHEET_ROW}>
        <Languages size={14} aria-hidden='true' /> {label}
      </button>
    );
  }

  return (
    <button type='button' aria-label={ariaLabel} onClick={() => setLocale(next)} className={`${TOOL_BTN} ${TOOL_VIS}`}>
      <Languages size={15} aria-hidden='true' />
      <span className='hidden md:inline'>{label}</span>
    </button>
  );
}

// Tools collapse behind the ⋯ toggle on ≤480px; the user chip, theme toggle
// and the ⋯ itself stay visible.
const TOOL_VIS = 'max-[480px]:hidden';

/** Terminal title bar: window dots + session name + right-aligned tools.
 *  ≤480px the tool buttons collapse behind a ⋯ toggle that expands a flat
 *  text sheet under the bar (no drawer, no animation — terminals don't slide). */
export function Header() {
  const sessionUser = useSessionUser();
  const navigate = useNavigate();
  const t = useT();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!toolsOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setToolsOpen(false);
      }
    };
    // Tapping outside the bar closes the sheet — on touch there is no Esc,
    // so an outside tap is the natural dismissal gesture.
    const onPointerDown = (event: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [toolsOpen]);

  return (
    <header
      ref={barRef}
      className='relative flex items-center gap-2 border-b border-border bg-card px-4.5 py-2.5 max-[640px]:gap-1.25 max-[640px]:px-3 max-[640px]:py-2'
    >
      <span className='size-2.75 shrink-0 rounded-full bg-[#e5544b]' aria-hidden='true' />
      <span className='size-2.75 shrink-0 rounded-full bg-[#d8a03c]' aria-hidden='true' />
      <span className='size-2.75 shrink-0 rounded-full bg-[#47a258]' aria-hidden='true' />
      <span className='ml-2.5 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground max-[599px]:hidden'>
        <Link to='/' className='group text-inherit no-underline'>
          <b className='font-semibold text-foreground group-hover:text-primary'>perfectpan@blog</b>
        </Link>
      </span>

      <div className='ml-auto flex items-center gap-1 max-[640px]:gap-0.5'>
        {sessionUser ? (
          <Link
            to='/account'
            data-testid='nav-account'
            className='inline-flex h-6 min-w-0 items-center gap-1.5 rounded border border-border bg-secondary px-2 text-xs leading-none hover:border-primary hover:no-underline'
            title={sessionUser.email}
          >
            <span className='block min-w-0 max-w-[16ch] overflow-hidden text-ellipsis whitespace-nowrap text-chart-1'>
              {sessionUser.name || sessionUser.email}
            </span>
            <span className='shrink-0 rounded-full bg-primary px-1.75 py-px text-xs leading-normal font-bold text-primary-foreground'>
              {getRoleLabel(sessionUser.role)}
            </span>
          </Link>
        ) : null}
        {sessionUser ? (
          <Link
            to='/logout'
            data-testid='nav-logout'
            aria-label={t(LOGOUT_ARIA)}
            className={`${TOOL_BTN} ${TOOL_VIS}`}
            onClick={(event) => {
              event.preventDefault();
              setLogoutOpen(true);
            }}
          >
            <LogOut size={15} aria-hidden='true' />
            <span className='hidden md:inline'>{t(NAV_LOGOUT)}</span>
          </Link>
        ) : (
          <>
            <Link to='/login' data-testid='nav-login' className={`${TOOL_BTN} ${TOOL_VIS}`}>
              <UserRound size={15} aria-hidden='true' />
              <span className='hidden md:inline'>{t(NAV_LOGIN)}</span>
            </Link>
            <Link to='/signup' data-testid='nav-signup' className={`${TOOL_BTN} ${TOOL_VIS}`}>
              <UserRoundPlus size={15} aria-hidden='true' />
              <span className='hidden md:inline'>{t(NAV_SIGNUP)}</span>
            </Link>
          </>
        )}
        <LocaleSwitcher variant='bar' />
        <DarkMode />
        <button
          type='button'
          aria-label={t(SEARCH_ARIA)}
          onClick={() => searchPalette.open()}
          className={`${TOOL_BTN} ${TOOL_VIS}`}
        >
          <Search size={15} aria-hidden='true' />
          <span className='hidden md:inline'>{t(SEARCH_TOOL)}</span>
        </button>
        <a
          href='https://github.com/PerfectPan'
          target='_blank'
          rel='noreferrer'
          aria-label={t(GITHUB_ARIA)}
          className={`${TOOL_BTN} ${TOOL_VIS}`}
        >
          <GithubMark size={15} />
          <span className='hidden md:inline'>{t(GITHUB_LABEL)}</span>
        </a>
        <a
          href='/rss.xml'
          target='_blank'
          rel='noreferrer'
          aria-label={t(RSS_ARIA)}
          className={`${TOOL_BTN} ${TOOL_VIS}`}
        >
          <Rss size={15} aria-hidden='true' />
          <span className='hidden md:inline'>{t(RSS_LABEL)}</span>
        </a>
        <button
          type='button'
          className={`${TOOL_BTN_TOGGLE} hidden`}
          aria-label={toolsOpen ? t(CLOSE_TOOLS_MENU) : t(OPEN_TOOLS_MENU)}
          aria-expanded={toolsOpen}
          onClick={() => {
            setToolsOpen(!toolsOpen);
          }}
        >
          {toolsOpen ? <X size={15} aria-hidden='true' /> : <MoreHorizontal size={15} aria-hidden='true' />}
        </button>
      </div>
      {toolsOpen ? (
        // Flat text sheet under the bar; every item closes it as its action
        // (the window-level Escape listener covers Esc as well).
        <div className='absolute inset-x-0 top-full z-40 hidden flex-col border-b border-border bg-secondary px-3 pt-1 pb-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.14)] max-[480px]:flex'>
          {sessionUser ? (
            <button
              type='button'
              onClick={() => {
                setToolsOpen(false);
                setLogoutOpen(true);
              }}
              className={SHEET_ROW}
            >
              <LogOut size={14} aria-hidden='true' /> {t(NAV_LOGOUT)}
            </button>
          ) : (
            <>
              <Link
                to='/login'
                onClick={() => {
                  setToolsOpen(false);
                }}
                className={SHEET_ROW}
              >
                <UserRound size={14} aria-hidden='true' /> {t(NAV_LOGIN)}
              </Link>
              <Link
                to='/signup'
                onClick={() => {
                  setToolsOpen(false);
                }}
                className={SHEET_ROW}
              >
                <UserRoundPlus size={14} aria-hidden='true' /> {t(NAV_SIGNUP)}
              </Link>
            </>
          )}
          <button
            type='button'
            onClick={() => {
              setToolsOpen(false);
              searchPalette.open();
            }}
            className={SHEET_ROW}
          >
            <Search size={14} aria-hidden='true' /> {t(SEARCH_TOOL)}
          </button>
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            onClick={() => {
              setToolsOpen(false);
            }}
            className={SHEET_ROW}
          >
            <GithubMark size={14} /> {t(GITHUB_LABEL)}
          </a>
          <a
            href='/rss.xml'
            target='_blank'
            rel='noreferrer'
            onClick={() => {
              setToolsOpen(false);
            }}
            className={SHEET_ROW}
          >
            <Rss size={14} aria-hidden='true' /> {t(RSS_LABEL)}
          </a>
          <LocaleSwitcher variant='sheet' />
        </div>
      ) : null}
      <ConfirmDialogGate open={logoutOpen}>
        <ConfirmDialog
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          command='logout'
          description={t(LOGOUT_CONFIRM_DESCRIPTION)}
          confirmLabel='logout'
          onConfirm={() => {
            setLogoutOpen(false);
            void navigate({ to: '/logout' });
          }}
        />
      </ConfirmDialogGate>
    </header>
  );
}

/** Keeps the lazy ConfirmDialog mounted after its first opening so radix can
 *  animate the close; renders nothing before that. */
function ConfirmDialogGate({ open, children }: { open: boolean; children: ReactNode }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (open) {
      setArmed(true);
    }
  }, [open]);
  return armed ? <Suspense fallback={null}>{children}</Suspense> : null;
}
