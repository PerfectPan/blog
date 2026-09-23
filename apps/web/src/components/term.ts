/**
 * Terminal-chrome class strings shared across shell components. Structure
 * colors come from the shadcn semantic tokens; decorative accents (cyan,
 * green) stay as literal per-theme hexes, same as the titlebar dots.
 */

// Title-bar tool button (login / grep / github / rss / theme / ⋯).
// Buttons inherit the mono font from v4 preflight. The 480px breakpoint
// collapses the tools into the ⋯ sheet (padding only — visibility is
// max-[480px]:hidden on the buttons themselves).
export const TOOL_BTN =
  'inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-1 rounded bg-transparent px-2 text-xs leading-none text-muted-foreground hover:text-primary hover:no-underline max-[480px]:px-[5px]';

// Same chrome as TOOL_BTN but no base display: the ⋯ toggle is hidden at
// base, and inline-flex outranks hidden in the v4 cascade, so a base
// display would defeat the hide. Carries its own max-[480px]:inline-flex
// (variants always sort after base utilities).
export const TOOL_BTN_TOGGLE =
  'h-6 shrink-0 cursor-pointer items-center justify-center rounded bg-transparent px-[5px] text-xs leading-none text-muted-foreground hover:text-primary max-[480px]:inline-flex';

// Sheet row inside the ⋯ menu (≤480px only).
export const SHEET_ROW =
  'flex cursor-pointer items-center gap-2 bg-transparent px-2.5 py-[9px] text-left text-sm text-muted-foreground hover:text-primary hover:no-underline';

// Page-intro enter recipe (tw-animate-css): fade + rise, held invisible
// through its delay by fill-mode-backwards. Not `both`: a forwards fill keeps
// the finished transform/filter/opacity effect applied, which leaves every
// row and article body a composited layer and stacking context for the life
// of the page. Pair with enterDelay() to stagger; reduced motion skips it.
export const ENTER =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:animation-duration-400 motion-safe:ease-out motion-safe:fill-mode-backwards';

// Same recipe for list rows: shorter and sideways, like lines scrolling in.
export const ENTER_ROW =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-1 motion-safe:animation-duration-300 motion-safe:fill-mode-backwards';

export const enterDelay = (ms: number) => ({ animationDelay: `${ms}ms` });

// When a page body (article, about) starts rising in: while its prompt is
// still typing, so the content never waits on the flourish.
export const BODY_ENTER_DELAY_MS = 180;
