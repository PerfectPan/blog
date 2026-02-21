import { Link } from '@tanstack/react-router';

type MenuLinkProps = {
  href: '/' | '/blog';
  name: string;
};

export function MenuLink({ href, name }: MenuLinkProps) {
  return (
    <div className='mx-2 flex h-16 items-center'>
      <span className='inline-block align-middle'>
        <Link
          to={href}
          className='opacity-70 transition-opacity hover:opacity-100'
        >
          {name}
        </Link>
      </span>
    </div>
  );
}
