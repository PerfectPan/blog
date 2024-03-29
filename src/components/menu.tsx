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
    <div className={`flex items-center mx-2 leading-10 text-custom-gray ${path === href ? "text-active-blue border-b-2 border-active-blue" : ""} hover:text-active-blue`}>
      <Link to={href}>{name}</Link>
    </div>
  )
}
