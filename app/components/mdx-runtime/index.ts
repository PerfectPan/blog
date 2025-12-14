import { Code } from './code.js';
import { H2 } from './h2.js';
import { Link } from './link.js';
import { Paragraph } from './paragraph.js';
import { Strong } from './strong.js';
import { OrderedList } from './ul.js';

export const MDXComponents = {
  h2: H2,
  p: Paragraph,
  a: Link,
  pre: Code,
  strong: Strong,
  ul: OrderedList,
};
