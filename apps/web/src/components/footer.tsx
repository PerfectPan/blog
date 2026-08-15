import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className='f-foot'>
      © {new Date().getFullYear()} PERFECTPAN · <Link to='/blog'>BLOG!</Link> ·{' '}
      <a href='/rss.xml'>RSS ↗</a> ·{' '}
      <a href='https://github.com/PerfectPan' target='_blank' rel='noreferrer'>
        GITHUB ↗
      </a>
    </footer>
  );
}
