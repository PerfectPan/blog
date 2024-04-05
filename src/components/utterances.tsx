'use client';

import { memo, useRef, useEffect, useState } from "react";

interface UtterancesProps {
  slug: string;
};

export const Utterances = memo(({ slug }: UtterancesProps) => {
  const [loaded, setLoaded] = useState(false);
  const utterancesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setLoaded(false);
    const el = document.createElement("script");
    if (utterancesRef.current) {
      el.src = "https://utteranc.es/client.js";
      el.async = true;
      el.setAttribute("repo", "PerfectPan/blog");
      el.setAttribute("issue-term", slug);
      el.setAttribute("label", "blog-comment");
      el.setAttribute("theme", "github-light");
      el.setAttribute("crossorigin", "anonymous");
      el.onload = () => {
        setLoaded(true);
      }
      utterancesRef.current.appendChild(el);
    }
    return () => {
      el.remove();
    }
  }, [slug]);

  return (
    <div key={slug} ref={utterancesRef} className="mt-7">
      {loaded || (
        <div>Cannot load comments. Please check you network.</div>
      )}
    </div>
  )
});
