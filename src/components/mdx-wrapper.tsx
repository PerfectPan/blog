'use client';

import { useEffect, type ReactNode } from "react";
import { scrollTo } from "../utils/dom.js";

interface MDXWrapperProps {
  children: ReactNode;
}

export const MDXWrapper = (props: MDXWrapperProps) => {
  useEffect(() => {
    if (window.location.hash.startsWith('#')) {
      // requestAnimationFrame can sure dom tree already rendered
      // maybe can change to ref
      requestAnimationFrame(() => {
        scrollTo(decodeURIComponent(window.location.hash.slice(1)));
      });
    }
  }, []);

  return <div>{props.children}</div>;
}
