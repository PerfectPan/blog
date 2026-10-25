import { Children, type CSSProperties, type ReactNode } from 'react';

const TYPE_MS_PER_CHAR = 20;
const TYPE_MS_MAX = 450;

function commandText(children: ReactNode): string | null {
  let text = '';
  for (const child of Children.toArray(children)) {
    if (typeof child !== 'string' && typeof child !== 'number') {
      return null;
    }
    text += child;
  }
  return text;
}

export function Prompt({
  user,
  host,
  cwd,
  className,
  typed = false,
  children
}: {
  user?: string;
  host?: string;
  cwd: string;
  className?: string;
  typed?: boolean;
  children?: ReactNode;
}) {
  const text = typed ? commandText(children) : null;
  return (
    <div className={`flex flex-wrap items-baseline gap-2.5 ${className ?? ''}`}>
      {user ? (
        <>
          <span className='text-chart-1'>{user}</span>
          <span className='text-muted-foreground/60'>@</span>
          <span className='text-chart-2'>{host}</span>{' '}
        </>
      ) : null}
      <span className='text-primary'>{cwd}</span>{' '}
      {text ? (
        // --chars / --type-ms drive term-type and term-caret (styles.css).
        <span
          className='flex min-w-0 max-w-full items-baseline text-foreground hover:text-primary'
          style={
            {
              '--chars': text.length,
              '--type-ms': `${Math.min(TYPE_MS_MAX, text.length * TYPE_MS_PER_CHAR)}ms`
            } as CSSProperties
          }
        >
          {/* Holds the whole command in ch; the animation grows it from 0 one
              character per step. As a min-w-0 flex item it still shrinks to
              an ellipsis when the wrapper hits the row's max-w-full. */}
          <span className='min-w-0 overflow-hidden text-ellipsis whitespace-nowrap [max-width:calc(var(--chars)*1ch)] motion-safe:animate-term-type'>
            {text}
          </span>
          <span
            className='ml-0.5 inline-block h-[1.1em] w-[0.6em] shrink-0 translate-y-[0.15em] bg-primary opacity-0 motion-safe:animate-term-caret'
            aria-hidden='true'
          />
        </span>
      ) : children != null ? (
        <span className='text-foreground hover:text-primary'>{children}</span>
      ) : null}
    </div>
  );
}
