import { cn } from './utils';

/**
 * ODS focus ring — high-contrast, keyboard-only (`focus-visible`).
 * Apply to interactive elements that do not use Button/Input primitives.
 */
export const ODS_FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Stronger ring when document is in keyboard-navigation mode. */
export const ODS_FOCUS_RING_KEYBOARD_CLASS =
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function odsFocusRing(className?: string): string {
  return cn(ODS_FOCUS_RING_CLASS, className);
}
