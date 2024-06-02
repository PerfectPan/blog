import type { ReactNode } from 'react';

interface StrongProps {
  children?: ReactNode;
}

export const Strong = (props: StrongProps) => {
  return <b className='font-extrabold'>{props.children}</b>;
};
