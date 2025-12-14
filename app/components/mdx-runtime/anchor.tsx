'use client';

import { scrollTo } from '../../utils/dom.js';

interface AnchorProps {
  anchorId: string;
}

export const Anchor = (props: AnchorProps) => {
  const { anchorId } = props;

  return (
    <a
      href={`#${anchorId}`}
      onClick={(e) => {
        // prevent default hash animation
        e.preventDefault();
        // FIXME: remove this won't work in production
        window.history.pushState('', '', `#${anchorId}`);
        scrollTo(anchorId);
      }}
    >
      {anchorId}
    </a>
  );
};
