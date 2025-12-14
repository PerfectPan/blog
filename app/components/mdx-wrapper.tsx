'use client';

import { type ReactNode, useEffect } from 'react';
import { scrollTo } from '../utils/dom';

interface MDXWrapperProps {
  children?: ReactNode;
  html?: string;
}

export const MDXWrapper = (props: MDXWrapperProps) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash.startsWith('#')) {
      requestAnimationFrame(() => {
        scrollTo(decodeURIComponent(window.location.hash.slice(1)));
      });
    }
  }, []);

  if (props.html) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML rendered from trusted MDX compilation
    return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
  }

  return <div>{props.children}</div>;
};
