export function Footer() {
  return (
    <footer className='j-colophon'>
      © {new Date().getFullYear()}, Built with{' '}
      <a href='https://tanstack.com/start/latest'>TanStack Start</a>
    </footer>
  );
}
