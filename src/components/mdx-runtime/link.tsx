import type { ReactNode } from 'react';

interface LinkProps {
  children?: ReactNode;
  href: string;
}

export const Link = (props: LinkProps) => {
  return (
    <a
      href={props.href}
      className="text-blue-700/80 transition-colors duration-300 ease-in-out hover:text-blue-700"
      target="_blank"
      rel="noreferrer"
    >
      {props.children}
    </a>
  );
};
