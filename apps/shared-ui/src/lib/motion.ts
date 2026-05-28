/**
 * ODS motion utility classes — GPU-friendly (transform/opacity), token-aligned durations/easing.
 * @see design-system/tokens/ANIMATION_TOKENS.md
 */

/** Color / border / background transitions */
export const odsTransitionColors =
  'transition-colors duration-fast ease-default motion-reduce:transition-none';

/** Transform transitions (sidebar, drawers, switches) */
export const odsTransitionTransform =
  'transition-transform duration-normal ease-out motion-reduce:transition-none';

export const odsTransitionOpacity =
  'transition-opacity duration-fast ease-default motion-reduce:transition-none';

export const odsTransitionShadow =
  'transition-[box-shadow,transform] duration-fast ease-default motion-reduce:transition-none';

/** Subtle press feedback — transform only */
export const odsPressable =
  'transition-transform duration-fast ease-default active:scale-[0.98] motion-reduce:active:scale-100';

/** Focus ring transition */
export const odsTransitionFocus =
  'transition-[box-shadow,outline-color] duration-fast ease-default motion-reduce:transition-none';

/** Modal / dialog enter (tailwindcss-animate) */
export const odsModalOverlay =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-normal ease-out motion-reduce:animate-none';

export const odsModalContent =
  'duration-normal ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none';

export const odsModalContentDesktop =
  'data-[state=closed]:min-[481px]:zoom-out-95 data-[state=open]:min-[481px]:zoom-in-95';

export const odsModalContentMobile =
  'data-[state=closed]:max-[480px]:slide-out-to-bottom data-[state=open]:max-[480px]:slide-in-from-bottom max-[480px]:motion-reduce:slide-in-from-bottom-0';

/** Tooltip */
export const odsTooltip =
  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-fast ease-out motion-reduce:animate-none';

/** Toast */
export const odsToastEnter =
  'animate-in fade-in-0 slide-in-from-top-2 duration-normal ease-out motion-reduce:animate-none';

export const odsToastExit =
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 duration-fast ease-in motion-reduce:animate-none';

/** Nav active indicator */
export const odsNavItemSidebar =
  'relative before:pointer-events-none before:absolute before:start-0 before:top-1/2 before:h-6 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity before:duration-normal before:ease-out motion-reduce:before:transition-none';

export const odsNavItemActive = 'before:opacity-100';

/** Sidebar width */
export const odsSidebarWidth =
  'transition-[width] duration-normal ease-in-out motion-reduce:transition-none';

/** Mobile drawer panel */
export const odsDrawerPanel =
  'transition-transform duration-normal ease-out motion-reduce:transition-none will-change-transform';

/** Backdrop */
export const odsBackdrop =
  'transition-opacity duration-normal ease-out motion-reduce:transition-none';

/** Search active ring */
export const odsSearchContainer =
  'transition-[box-shadow] duration-fast ease-default motion-reduce:transition-none';

/** Interactive card */
export const odsCardInteractive =
  'transition-[box-shadow,border-color,background-color] duration-fast ease-default hover:shadow-md motion-reduce:transition-none';

/** Table row */
export const odsTableRow = `${odsTransitionColors} hover:bg-muted/50`;

/** Chart tooltip */
export const odsChartTooltip =
  `${odsTransitionOpacity} duration-fast opacity-0 group-hover:opacity-100 group-focus-within:opacity-100`;
