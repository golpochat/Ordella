'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { ODS_FOCUS_RING_CLASS } from '../lib/focus-ring';

export type VisuallyHiddenProps = React.HTMLAttributes<HTMLSpanElement>;

/** Screen-reader-only text; visible on focus when used as skip-link sibling pattern. */
export function VisuallyHidden({ className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
        '[clip:rect(0,0,0,0)] [clip-path:inset(50%)]',
        className,
      )}
      {...props}
    />
  );
}

export type SkipToContentProps = {
  targetId?: string;
  label?: string;
  className?: string;
};

/** First tab stop — jumps to main content. */
export function SkipToContent({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'fixed left-4 top-4 z-[600] -translate-y-24 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-md transition-transform duration-normal ease-out motion-reduce:transition-none',
        'focus:translate-y-0',
        ODS_FOCUS_RING_CLASS,
        className,
      )}
    >
      {label}
    </a>
  );
}

export type LiveRegionProps = React.HTMLAttributes<HTMLDivElement> & {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
};

/** Announces dynamic updates to assistive tech. */
export function LiveRegion({
  politeness = 'polite',
  atomic = true,
  className,
  ...props
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn(
        'pointer-events-none absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
        '[clip:rect(0,0,0,0)]',
        className,
      )}
      {...props}
    />
  );
}

export type FocusRingProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'span';
};

/** Wrapper that applies ODS focus ring to a single focusable child. */
export function FocusRing({ as: Component = 'div', className, children, ...props }: FocusRingProps) {
  return (
    <Component className={cn(ODS_FOCUS_RING_CLASS, className)} {...props}>
      {children}
    </Component>
  );
}

export type AccessibilityProviderProps = {
  children: React.ReactNode;
  /** When true, forces high-contrast tokens (e.g. ODS high-contrast appearance). */
  highContrastOverride?: boolean;
};

type AccessibilityContextValue = {
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
};

const AccessibilityContext = React.createContext<AccessibilityContextValue>({
  keyboardNavigation: false,
  reducedMotion: false,
  highContrast: false,
});

export function useAccessibility(): AccessibilityContextValue {
  return React.useContext(AccessibilityContext);
}

function useMediaPreference(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

/** Sets document data attributes for reduced motion, high contrast, and keyboard mode. */
export function AccessibilityProvider({ children, highContrastOverride }: AccessibilityProviderProps) {
  const reducedMotion = useMediaPreference('(prefers-reduced-motion: reduce)');
  const systemHighContrast = useMediaPreference('(prefers-contrast: more)');
  const highContrast = highContrastOverride === true || systemHighContrast;
  const [keyboardNavigation, setKeyboardNavigation] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.odsReducedMotion = reducedMotion ? 'true' : 'false';
    root.dataset.odsHighContrast = highContrast ? 'true' : 'false';
    root.dataset.odsKeyboardNav = keyboardNavigation ? 'true' : 'false';
  }, [reducedMotion, highContrast, keyboardNavigation]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') setKeyboardNavigation(true);
    };
    const onPointer = () => setKeyboardNavigation(false);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, []);

  const value = React.useMemo(
    () => ({ keyboardNavigation, reducedMotion, highContrast }),
    [keyboardNavigation, reducedMotion, highContrast],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}
