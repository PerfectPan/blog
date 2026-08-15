import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer
      className='py-5 text-center'
      style={{
        fontFamily: 'var(--e-mono)',
        fontSize: 10.5,
        letterSpacing: '0.3em',
        color: 'var(--e-faint)',
      }}
    >
      PERFECTPAN.ORG · DWG SET © {new Date().getFullYear()} ·{' '}
      <Link to='/blog' style={{ color: 'var(--e-dim)' }}>
        INDEX
      </Link>
    </footer>
  );
}
