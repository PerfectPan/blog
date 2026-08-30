import type { ReactNode } from 'react';

/**
 * Page frame for every terminal-skin route: centered column with the
 * responsive gutters (wider padding ≥640px). Replaces the old `.th-page`
 * CSS class — styles live here as utilities now.
 */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div className='mx-auto w-full max-w-[1020px] px-[22px] pt-[26px] pb-[46px] max-[640px]:px-3.5 max-[640px]:pt-5 max-[640px]:pb-10 min-[640px]:max-[1100px]:px-11'>
      {children}
    </div>
  );
}

/**
 * One prompt line — the terminal skin's section header. Renders
 * `user @ host path % command` with the fixed prompt color coding.
 * `children` is the command slot (text or a Link).
 */
export function Prompt({
  user = 'perfectpan',
  host = 'blog',
  path = '~ %',
  className = '',
  children,
}: {
  user?: string;
  host?: string;
  path?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap items-baseline gap-2.5 ${className}`}>
      <span className='text-cyan'>{user}</span>
      <span className='text-faint'>@</span>
      <span className='text-green'>{host}</span>{' '}
      <span className='text-amber'>{path}</span>{' '}
      <span className='text-ink'>{children}</span>
    </div>
  );
}

/** Shared control styles (auth forms, comment composer, load-more). */
export const fieldLabel =
  'mb-1.5 block text-[13px] text-dim before:text-amber before:content-["▸_"]';
export const input =
  'w-full rounded-md border border-line bg-panel px-3 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:border-amber focus:shadow-[0_0_0_2px_rgba(233,180,76,0.15)] focus:outline-none max-[640px]:text-base';
export const btn =
  'cursor-pointer rounded-md border border-line bg-panel px-[18px] py-2.5 font-mono text-[13.5px] text-ink transition-colors duration-100 hover:border-amber hover:text-amber active:translate-y-px';
export const btnPrimary =
  'cursor-pointer rounded-md border border-amber bg-amber px-[18px] py-2.5 font-mono text-[13.5px] font-bold text-[#171106] transition-colors duration-100 hover:bg-[#f0c268] hover:border-[#f0c268] hover:text-[#171106] active:translate-y-px';
export const roleBadge =
  'rounded-full bg-amber px-[7px] py-px text-[10px] font-bold text-amber-ink';
