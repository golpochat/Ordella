'use client';

import * as React from 'react';
import { Contrast, Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { IconButton } from '../components/icon-button';
import { Flex } from '../components/layout/flex';
import { VisuallyHidden } from '../components/accessibility';
import type { OdsAppearance } from './appearance';
import { useOdsThemeOptional } from './ods-theme-provider';

export type ThemeSwitcherProps = {
  className?: string;
  /** Compact icon-only toggle group. */
  variant?: 'icons' | 'labeled';
};

const MODES: { id: OdsAppearance; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'light', label: 'Light theme', icon: Sun },
  { id: 'dark', label: 'Dark theme', icon: Moon },
  { id: 'system', label: 'System theme', icon: Monitor },
  { id: 'high-contrast', label: 'High contrast theme', icon: Contrast },
];

/** Keyboard-accessible appearance switcher (light / dark / system / high contrast). */
export function ThemeSwitcher({ className, variant = 'icons' }: ThemeSwitcherProps) {
  const theme = useOdsThemeOptional();
  if (!theme) return null;

  const { appearance, setAppearance } = theme;

  return (
    <Flex
      gap="xs"
      align="center"
      role="group"
      aria-label="Color theme"
      className={cn('rounded-md border border-border bg-card p-0.5 shadow-sm', className)}
    >
      {MODES.map((mode) => {
        const active = appearance === mode.id;
        const Icon = mode.icon;
        return (
          <IconButton
            key={mode.id}
            type="button"
            size="sm"
            variant={active ? 'default' : 'ghost'}
            aria-label={mode.label}
            aria-pressed={active}
            onClick={() => setAppearance(mode.id)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {variant === 'labeled' ? (
              <span className="sr-only">{mode.label}</span>
            ) : (
              <VisuallyHidden>{mode.label}</VisuallyHidden>
            )}
          </IconButton>
        );
      })}
    </Flex>
  );
}
