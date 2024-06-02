import type { ReactNode } from 'react';
import { Anchor } from './anchor.js';

interface H2Props {
  children?: ReactNode;
}

export const H2 = (props: H2Props) => {
  const { children } = props;
  const id = typeof children === 'string' ? children : '';

  return (
    <h2
      id={id}
      className='mb-6 mt-14 text-balance font-black text-2xl leading-none first:mt-0 f'
    >
      <Anchor anchorId={id} />
    </h2>
  );
};
