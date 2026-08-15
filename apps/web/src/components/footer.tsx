import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className='z-foot'>
      PERFECTPAN ・ {new Date().getFullYear()} ・ <Link to='/blog'>読</Link> ・{' '}
      <a href='/rss.xml'>RSS</a>
    </footer>
  );
}
