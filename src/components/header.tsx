import { Github, Rss } from 'lucide-react';

import { MenuLink } from './menu.js';
import { DarkMode } from './dark-mode.js';

export const Header = () => {
  return (
    <header className='fixed left-0 top-0 right-0 h-16 bg-[rgba(255,255,255,0.985)] border-b border-[#F0F0F2] z-10 shadow-md dark:bg-wash-dark dark:border-slate-300/10'>
      <div className='mx-6 flex items-center'>
        <span className='text-white font-bold bg-black border-10 border-black rounded-md dark:bg-neutral-900 dark:border-neutral-900'>PerfectPan</span>
        <div className='list-none m-0 flex items-center pl-1'>
          <MenuLink href="/" name="Home" />
          <MenuLink href="/blog" name="Blog" />
        </div>
        <div className="ml-auto flex gap-4">
          <DarkMode />
          <a href="https://github.com/PerfectPan" target="blank" className='flex items-center'>
            <Github size={22} className='opacity-70 hover:opacity-100'/>
          </a>
          <a href="/rss.xml" target="blank">
            <Rss size={24} className='opacity-70 hover:opacity-100'/>
          </a>
        </div>
      </div>
    </header>
  );
};
