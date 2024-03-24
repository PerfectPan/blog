'use client';

import { Link } from 'waku';
// import { useState } from 'react';

interface MenuLinkProps {
  href: string;
  name: string;
}

export const MenuLink = (props: MenuLinkProps) => {
  const { href, name } = props;
  // ${location.pathname === href ? "text-active-blue border-b-2 border-active-blue" : ""}`
  return (
    <div className={`flex items-center mx-2 leading-10 text-custom-gray hover:text-active-blue`}>
      <Link to={href}>{name}</Link>
    </div>
  )
}
