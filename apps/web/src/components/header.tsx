import { Github, Rss } from 'lucide-react';
import { DarkMode } from './dark-mode.js';
import { MenuLink } from './menu.js';

export function Header() {
  return (
    <header className='fixed left-0 top-0 right-0 z-10 h-16 border-b border-[#F0F0F2] bg-[rgba(255,255,255,0.985)] shadow-md dark:border-slate-300/10 dark:bg-wash-dark'>
      <div className='mx-6 flex items-center'>
        <span className='rounded-md border-10 border-black bg-black font-bold text-white dark:border-neutral-900 dark:bg-neutral-900'>
          PerfectPan
        </span>
        <div className='m-0 flex list-none items-center pl-1'>
          <MenuLink href='/' name='Home' />
          <MenuLink href='/blog' name='Blog' />
        </div>
        <div className='ml-auto flex gap-4'>
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
