/** Vertical toolbar separator. `size` picks the height: the editor toolbar
 *  uses 'md' (h-5), the comment toolbar 'sm' (h-4). */
export function ToolbarDivider({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return <span className={`mx-1 ${size === 'sm' ? 'h-4' : 'h-5'} w-px bg-border`} />;
}
