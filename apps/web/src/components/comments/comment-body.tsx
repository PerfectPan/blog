type CommentBodyProps = {
  /** Pre-rendered on the worker (comments-service → renderCommentHtml). */
  html: string;
};

/** Injects a server-rendered comment body. Replaces the old client-side
 *  CommentMarkdown island — react-markdown no longer ships to the browser. */
export function CommentBody({ html }: CommentBodyProps) {
  return (
    <div
      className='text-sm leading-6'
      // biome-ignore lint/security/noDangerouslySetInnerHtml: rendered on the worker by comments-service through react-markdown (no rehype-raw, sanitized urlTransform) — identical XSS posture to the previous client-side render.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
