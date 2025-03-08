import { Link } from 'waku';

interface MenuLinkProps {
  href: `/${string}`;
  name: string;
}

export const MenuLink = (props: MenuLinkProps) => {
  const { href, name } = props;

  return (
    <div className='mx-2 h-16 flex items-center'>
      <span className='inline-block align-middle'>
        <Link to={href} className='opacity-70 hover:opacity-100'>
          {name}
        </Link>
      </span>
    </div>
  );
};
