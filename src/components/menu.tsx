'use client';

import { Link, useRouter_UNSTABLE as useRouter } from 'waku';

interface MenuLinkProps {
  href: string;
  name: string;
}

export const MenuLink = (props: MenuLinkProps) => {
  const { href, name } = props;
  const router = useRouter();
  const { path } = router.value;

  return (
    <div className={`mx-2 leading-16 h-16 ${path === href ? "text-active-blue border-b-2 border-active-blue" : "text-custom-gray"} hover:text-active-blue`}>
      <span className='inline-block align-middle'><Link to={href}>{name}</Link></span>
    </div>
  )
}
