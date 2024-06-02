import type { ReactNode } from 'react';

interface ParagraphProps {
  children?: ReactNode;
}

export const Paragraph = (props: ParagraphProps) => {
  return <p className='mb-6 leading-7'>{props.children}</p>;
};
