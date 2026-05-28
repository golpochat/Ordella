'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  SHORTCUT_SCOPE_PRIORITY,
  eventMatchesShortcut,
  formatShortcutCombo,
  isEditableTarget,
  type ShortcutScopeId,
} from '../lib/keyboard-shortcut-utils';
import { Flex } from './layout/flex';
import { Stack } from './layout/stack';

export type ShortcutDefinition = {
  id: string;
  combo: string;
  description: string;
  scope: ShortcutScopeId;
  group?: string;
  allowInInput?: boolean;
  /** When false, shortcut is skipped (e.g. page has no create action). */
  enabled?: boolean;
  /** Run when combo matches; call `event.preventDefault()` to block browser default. */
  onTrigger: (event: KeyboardEvent) => void;
};

export type ShortcutMode = 'full' | 'limited' | 'off';

type ShortcutManagerContextValue = {
  mode: ShortcutMode;
  modalDepth: number;
  setModalDepth: React.Dispatch<React.SetStateAction<number>>;
  register: (shortcuts: ShortcutDefinition[]) => () => void;
  shortcuts: ShortcutDefinition[];
  overlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
};

const ShortcutManagerContext = React.createContext<ShortcutManagerContextValue | null>(null);

export function useShortcutManager(): ShortcutManagerContextValue {
  const ctx = React.useContext(ShortcutManagerContext);
  if (!ctx) {
    throw new Error('useShortcutManager must be used within ShortcutManager');
  }
  return ctx;
}

export type ShortcutManagerProps = {
  children: React.ReactNode;
  mode?: ShortcutMode;
};

/** Root keyboard shortcut registry and document listener. */
export function ShortcutManager({ children, mode = 'full' }: ShortcutManagerProps) {
  const [modalDepth, setModalDepth] = React.useState(0);
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [registry, setRegistry] = React.useState<ShortcutDefinition[]>([]);

  const register = React.useCallback((shortcuts: ShortcutDefinition[]) => {
    setRegistry((current) => [...current, ...shortcuts]);
    return () => {
      setRegistry((current) => current.filter((item) => !shortcuts.some((s) => s.id === item.id)));
    };
  }, []);

  const value = React.useMemo(
    () => ({
      mode,
      modalDepth,
      setModalDepth,
      register,
      shortcuts: registry,
      overlayOpen,
      setOverlayOpen,
    }),
    [mode, modalDepth, register, registry, overlayOpen],
  );

  React.useEffect(() => {
    if (mode === 'off') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const editable = isEditableTarget(event.target);
      const modalActive = modalDepth > 0;

      const candidates = registry
        .filter((shortcut) => shortcut.enabled !== false)
        .filter((shortcut) => {
          if (editable && !shortcut.allowInInput) return false;
          if (modalActive && shortcut.scope !== 'modal' && shortcut.scope !== 'form') return false;
          if (mode === 'limited' && parseShortcutNeedsMod(shortcut.combo)) return false;
          return true;
        })
        .sort((a, b) => SHORTCUT_SCOPE_PRIORITY[b.scope] - SHORTCUT_SCOPE_PRIORITY[a.scope]);

      for (const shortcut of candidates) {
        if (!eventMatchesShortcut(event, shortcut.combo)) continue;
        shortcut.onTrigger(event);
        if (event.defaultPrevented) return;
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [registry, modalDepth, mode]);

  return (
    <ShortcutManagerContext.Provider value={value}>{children}</ShortcutManagerContext.Provider>
  );
}

function parseShortcutNeedsMod(combo: string): boolean {
  return combo.toLowerCase().includes('mod') || combo.toLowerCase().includes('cmd') || combo.toLowerCase().includes('ctrl');
}

/** Increments modal depth while `open` so global/page shortcuts are suppressed. */
export function useShortcutModalLock(open: boolean) {
  const { setModalDepth } = useShortcutManager();
  React.useEffect(() => {
    if (!open) return;
    setModalDepth((depth) => depth + 1);
    return () => setModalDepth((depth) => Math.max(0, depth - 1));
  }, [open, setModalDepth]);
}

export type ShortcutScopeProps = {
  scope: ShortcutScopeId;
  shortcuts: ShortcutDefinition[];
  enabled?: boolean;
  children?: React.ReactNode;
};

/** Registers shortcuts for a page, table, form, or modal scope. */
export function ShortcutScope({ scope, shortcuts, enabled = true, children }: ShortcutScopeProps) {
  const { register, mode } = useShortcutManager();

  const scoped = React.useMemo(
    () =>
      shortcuts.map((shortcut) => ({
        ...shortcut,
        scope,
        id: shortcut.id.startsWith(`${scope}:`) ? shortcut.id : `${scope}:${shortcut.id}`,
      })),
    [scope, shortcuts],
  );

  React.useEffect(() => {
    if (!enabled || mode === 'off') return;
    return register(scoped);
  }, [enabled, mode, register, scoped]);

  return children ?? null;
}

export type ShortcutHintProps = {
  combo: string;
  className?: string;
  /** Accessible label override; defaults to formatted combo. */
  'aria-label'?: string;
};

/** Inline kbd-style hint for menus, buttons, and tooltips. */
export function ShortcutHint({ combo, className, 'aria-label': ariaLabel }: ShortcutHintProps) {
  const label = formatShortcutCombo(combo);
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex min-h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium leading-none text-muted-foreground',
        className,
      )}
      aria-label={ariaLabel ?? `Keyboard shortcut ${label}`}
    >
      {label}
    </kbd>
  );
}

export type ShortcutOverlayGroup = {
  title: string;
  shortcuts: Array<{ combo: string; description: string }>;
};

export type ShortcutOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ShortcutOverlayGroup[];
  title?: string;
  description?: string;
};

/** Discoverability overlay listing active shortcuts (desktop / tablet). */
export function ShortcutOverlay({
  open,
  onOpenChange,
  groups,
  title = 'Keyboard shortcuts',
  description = 'Shortcuts are disabled on mobile. Press ? to open this panel.',
}: ShortcutOverlayProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ods-shortcut-overlay-title"
        aria-describedby="ods-shortcut-overlay-desc"
        className="max-h-[min(90vh,720px)] w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <Stack gap="md" className="p-6">
          <Stack gap="xs">
            <h2 id="ods-shortcut-overlay-title" className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            <p id="ods-shortcut-overlay-desc" className="text-sm text-muted-foreground">
              {description}
            </p>
          </Stack>
          <div className="max-h-[50vh] overflow-y-auto pr-1">
            <Stack gap="lg">
              {groups.map((group) => (
                <Stack key={group.title} gap="sm">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.shortcuts.map((shortcut) => (
                      <li key={`${group.title}-${shortcut.combo}-${shortcut.description}`}>
                        <Flex justify="between" align="center" gap="md" className="text-sm">
                          <span className="text-foreground">{shortcut.description}</span>
                          <ShortcutHint combo={shortcut.combo} />
                        </Flex>
                      </li>
                    ))}
                  </ul>
                </Stack>
              ))}
            </Stack>
          </div>
          <Flex justify="end">
            <button
              type="button"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </Flex>
        </Stack>
      </div>
    </div>
  );
}
