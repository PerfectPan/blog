import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className='g-foot'>
      <span>PERFECTPAN.ORG — {new Date().getFullYear()}</span>
      <Link to='/blog'>/BLOG</Link>
      <Link to='/projects'>/PROJECTS</Link>
      <a href='/rss.xml'>RSS ↗</a>
    </footer>
  );
}
