export function Footer() {
  return (
    <footer className='j-colophon'>
      废墨集 · {new Date().getFullYear()} 年 · <a href='/rss.xml'>RSS 订阅</a> ·
      全刊运行于 <a href='https://tanstack.com/start/latest'>TanStack Start</a>{' '}
      与 Cloudflare 之上
    </footer>
  );
}
