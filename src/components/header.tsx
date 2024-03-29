import { MenuLink } from './menu.js';

export const Header = () => {
  return (
    <header className="fixed left-0 top-0 right-0 h-16 bg-[rgba(255,255,255,0.985)] border-b border-[#F0F0F2] z-10 shadow-md">
      <div className='mx-6 flex items-center'>
        <span className="text-white font-bold bg-black border border-10 border-black rounded-md">PerfectPan</span>
        <div className="list-none m-0 flex h-16 pl-1">
          <MenuLink href="/" name="Home" />
          <MenuLink href="/blog" name="Blog" />
        </div>
      </div>
    </header>
  );
};
