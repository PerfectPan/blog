import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className='c-foot'>
      <span>PERFECTPAN.ORG — {new Date().getFullYear()}</span>
      <span>
        <Link to='/blog'>/BLOG</Link>
      </span>
      <span>
        <Link to='/projects'>/PROJECTS</Link>
      </span>
      <a href='/rss.xml'>RSS ↗</a>
      <a href='https://github.com/PerfectPan' target='_blank' rel='noreferrer'>
        GITHUB ↗
      </a>
    </footer>
  );
}
