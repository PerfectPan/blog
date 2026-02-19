import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='app-shell'>
      <header className='site-header'>
        <div className='site-header__inner'>
          <Link to='/' className='site-title'>
            PerfectPan Blog
          </Link>
          <nav className='site-nav'>
            <Link to='/blog' className='site-nav__item'>
              Blog
            </Link>
            <Link to='/login' className='site-nav__item'>
              Login
            </Link>
            <Link to='/signup' className='site-nav__item'>
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className='site-main'>{children}</main>

      <footer className='site-footer'>
        <span>Powered by TanStack Start + Payload</span>
      </footer>
    </div>
  );
}
