import { Code } from './code';
import { H2 } from './h2';
import { Link } from './link';
import { Paragraph } from './paragraph';
import { Strong } from './strong';
import { OrderedList } from './ul';

export const MDXComponents = {
  h2: H2,
  p: Paragraph,
  a: Link,
  pre: Code,
  strong: Strong,
  ul: OrderedList,
};
