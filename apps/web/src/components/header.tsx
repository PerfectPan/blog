import type { Locale } from '@blog/shared';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Github,
  Languages,
  LogOut,
  MoreHorizontal,
  Rss,
  Search,
  UserRound,
  UserRoundPlus,
  X,
} from 'lucide-react';
import {
  lazy,
  type ReactNode,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  SWITCH_LOCALE,
} from '../lib/i18n/messages.js';
import { useSessionUser } from '../lib/session-user.js';
import { DarkMode } from './dark-mode.js';
import { searchPalette } from './search-palette-store.js';
import { SHEET_ROW, TOOL_BTN, TOOL_BTN_TOGGLE } from './term.js';

// The logout confirm dialog (radix Dialog) loads in its own chunk, mounted
// on first use, so radix stays out of the logged-out pages' critical path.
const ConfirmDialog = lazy(() =>
  import('./confirm-dialog.js').then((m) => ({ default: m.ConfirmDialog })),
);

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
      <button
        type='button'
        aria-label={ariaLabel}
        onClick={() => setLocale(next)}
        className={SHEET_ROW}
      >
        <Languages size={14} aria-hidden='true' /> {label}
      </button>
    );
  }

  return (
    <button
      type='button'
      aria-label={ariaLabel}
      onClick={() => setLocale(next)}
      className={`${TOOL_BTN} ${TOOL_VIS}`}
    >
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
      <span
        className='size-2.75 shrink-0 rounded-full bg-[#e5544b]'
        aria-hidden='true'
      />
      <span
        className='size-2.75 shrink-0 rounded-full bg-[#d8a03c]'
        aria-hidden='true'
      />
      <span
        className='size-2.75 shrink-0 rounded-full bg-[#47a258]'
        aria-hidden='true'
      />
      <span className='ml-2.5 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground max-[599px]:hidden'>
        <Link to='/' className='group text-inherit no-underline'>
          <b className='font-semibold text-foreground group-hover:text-primary'>
            perfectpan@blog
          </b>
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
            <Link
              to='/login'
              data-testid='nav-login'
              className={`${TOOL_BTN} ${TOOL_VIS}`}
            >
              <UserRound size={15} aria-hidden='true' />
              <span className='hidden md:inline'>{t(NAV_LOGIN)}</span>
            </Link>
            <Link
              to='/signup'
              data-testid='nav-signup'
              className={`${TOOL_BTN} ${TOOL_VIS}`}
            >
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
          <Github size={15} aria-hidden='true' />
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
            <Github size={14} aria-hidden='true' /> {t(GITHUB_LABEL)}
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
            navigate({ to: '/logout' });
          }}
        />
      </ConfirmDialogGate>
    </header>
  );
}

/** Keeps the lazy ConfirmDialog mounted after its first opening so radix can
 *  animate the close; renders nothing before that. */
function ConfirmDialogGate({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (open) {
      setArmed(true);
    }
  }, [open]);
  return armed ? <Suspense fallback={null}>{children}</Suspense> : null;
}
