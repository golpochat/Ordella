'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  AccessibilityProvider,
  LiveRegion,
  SkipToContent,
  VisuallyHidden,
  bindFocusTrap,
  useAccessibility,
  useOdsThemeOptional,
} from '@shared-ui';
import { useTranslationOptional } from '@/components/ui/admin-i18n';

export {
  AccessibilityProvider,
  FocusRing,
  LiveRegion,
  SkipToContent,
  useAccessibility,
  VisuallyHidden,
  odsFocusRing,
  ODS_FOCUS_RING_CLASS,
} from '@shared-ui';

export const ADMIN_MAIN_CONTENT_ID = 'admin-main-content';

/** Skip link + route change announcements for admin shell. */
export function AdminAccessibilityShell({ children }: { children: React.ReactNode }) {
  const odsTheme = useOdsThemeOptional();

  return (
    <AccessibilityProvider highContrastOverride={odsTheme?.highContrast}>
      <SkipToContent targetId={ADMIN_MAIN_CONTENT_ID} />
      <RouteChangeAnnouncer />
      {children}
    </AccessibilityProvider>
  );
}

function RouteChangeAnnouncer() {
  const pathname = usePathname();
  const i18n = useTranslationOptional();
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    const label = segments.length ? segments.join(', ').replace(/-/g, ' ') : 'dashboard';
    setMessage(
      i18n ? i18n.t('shell.navigatedTo', { label }) : `Navigated to ${label}`,
    );
  }, [pathname, i18n]);

  return <LiveRegion politeness="polite">{message}</LiveRegion>;
}

/** Trap focus inside mobile navigation drawer while open. */
export function useDrawerFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!active || !containerRef.current) return;
    return bindFocusTrap(containerRef.current);
  }, [active, containerRef]);
}

/** Close drawer/menu on Escape. */
export function useEscapeToClose(active: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onClose]);
}
