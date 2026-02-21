'use client';

import { memo, useEffect, useRef, useState } from 'react';

type UtterancesProps = {
  slug: string;
};

export const Utterances = memo(({ slug }: UtterancesProps) => {
  const [loaded, setLoaded] = useState(false);
  const utterancesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setLoaded(false);
    const script = document.createElement('script');

    if (utterancesRef.current) {
      script.src = 'https://utteranc.es/client.js';
      script.async = true;
      script.setAttribute('repo', 'PerfectPan/blog');
      script.setAttribute('issue-term', slug);
      script.setAttribute('label', 'blog-comment');
      script.setAttribute('theme', 'github-light');
      script.setAttribute('crossorigin', 'anonymous');
      script.onload = () => {
        setLoaded(true);
      };
      utterancesRef.current.appendChild(script);
    }

    return () => {
      script.remove();
    };
  }, [slug]);

  return (
    <div key={slug} ref={utterancesRef} className='mt-7'>
      {loaded || <div>Cannot load comments. Please check you network.</div>}
    </div>
  );
});
