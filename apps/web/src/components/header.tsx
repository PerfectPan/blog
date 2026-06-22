import { Link } from '@tanstack/react-router';
import { Github, LogOut, Rss, UserRound } from 'lucide-react';
import { authClient } from '../lib/auth-client.js';
import { DarkMode } from './dark-mode.js';
import { MenuLink } from './menu.js';

function getRoleLabel(role?: string | null): string {
  if (role === 'admin') {
    return 'ADMIN';
  }

  if (role === 'vip') {
    return 'VIP';
  }

  return 'MEMBER';
}

export function Header() {
  const { data: sessionData } = authClient.useSession();
  const sessionUser = sessionData?.user ?? null;

  return (
    <header className='fixed left-0 top-0 right-0 z-10 border-b border-[#F0F0F2] bg-[rgba(255,255,255,0.9)] shadow-md backdrop-blur dark:border-slate-300/10 dark:bg-[rgba(15,23,42,0.9)]'>
      <div className='mx-4 flex h-16 items-center sm:mx-6'>
        <Link
          to='/'
          className='rounded-md border-10 border-black bg-black px-1 font-bold text-white dark:border-neutral-900 dark:bg-neutral-900'
        >
          PerfectPan
        </Link>
        <div className='m-0 flex list-none items-center pl-1'>
          <MenuLink href='/' name='Home' />
          <MenuLink href='/blog' name='Blog' />
          <MenuLink href='/projects' name='Projects' />
        </div>
        <div className='ml-auto flex items-center gap-2 sm:gap-3'>
          {sessionUser ? (
            <div className='hidden items-center gap-2 rounded-full border border-[#d0d0d3] px-3 py-1 text-xs text-gray-700 md:flex dark:border-slate-600 dark:text-slate-200'>
              <UserRound size={14} className='opacity-70' />
              <span className='max-w-[220px] truncate'>
                {sessionUser.email}
              </span>
              <span className='rounded-full bg-black px-2 py-[2px] text-[10px] font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900'>
                {getRoleLabel(sessionUser.role)}
              </span>
            </div>
          ) : null}
          {sessionUser ? (
            <Link
              to='/logout'
              className='inline-flex items-center gap-1 rounded-md border border-[#d0d0d3] px-2 py-1 text-sm opacity-85 transition-opacity hover:opacity-100 dark:border-slate-600'
            >
              <LogOut size={14} />
              <span className='hidden sm:inline'>Logout</span>
            </Link>
          ) : (
            <>
              <Link to='/login' className='opacity-70 hover:opacity-100'>
                Login
              </Link>
              <Link to='/signup' className='opacity-70 hover:opacity-100'>
                Sign Up
              </Link>
            </>
          )}
          <DarkMode />
          <a
            href='https://github.com/PerfectPan'
            target='_blank'
            rel='noreferrer'
            className='flex items-center'
          >
            <Github size={22} className='opacity-70 hover:opacity-100' />
          </a>
          <a href='/rss.xml' target='_blank' rel='noreferrer'>
            <Rss size={24} className='opacity-70 hover:opacity-100' />
          </a>
        </div>
      </div>
    </header>
  );
}
