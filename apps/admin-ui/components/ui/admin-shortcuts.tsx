'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Flex,
  SearchInput,
  ShortcutHint,
  ShortcutManager,
  ShortcutOverlay,
  ShortcutScope,
  Stack,
  type ShortcutDefinition,
  type ShortcutMode,
  type ShortcutOverlayGroup,
  useShortcutManager,
  useShortcutModalLock,
} from '@shared-ui';
import { useTranslation } from '@/components/ui/admin-i18n';
import { DASHBOARD_NAV, navLabelKey } from '@/lib/navigation';
import { resolvePageShortcutConfig } from '@/lib/admin-shortcut-registry';

export {
  ShortcutHint,
  ShortcutManager,
  ShortcutOverlay,
  ShortcutScope,
  useShortcutManager,
  useShortcutModalLock,
};
export type { ShortcutDefinition, ShortcutMode, ShortcutOverlayGroup };

function useAdminShortcutMode(): ShortcutMode {
  const [mode, setMode] = React.useState<ShortcutMode>('full');

  React.useEffect(() => {
    const mobile = window.matchMedia('(max-width: 480px)');
    const tablet = window.matchMedia('(min-width: 481px) and (max-width: 768px)');

    const update = () => {
      if (mobile.matches) setMode('off');
      else if (tablet.matches) setMode('limited');
      else setMode('full');
    };

    update();
    mobile.addEventListener('change', update);
    tablet.addEventListener('change', update);
    return () => {
      mobile.removeEventListener('change', update);
      tablet.removeEventListener('change', update);
    };
  }, []);

  return mode;
}

export function focusPageSearch(): void {
  const el =
    document.querySelector<HTMLInputElement>('[data-ods-page-search]') ??
    document.querySelector<HTMLInputElement>('[data-ods-search]');
  el?.focus();
  el?.select();
}

export function submitPrimarySaveForm(): void {
  const form = document.querySelector<HTMLFormElement>('form[data-ods-save-form]');
  form?.requestSubmit();
}

export function clickPagePrimaryAction(actionId: string): void {
  document.querySelector<HTMLElement>(`[data-ods-action="${actionId}"]`)?.click();
}

export function refreshCurrentPage(): void {
  window.dispatchEvent(new CustomEvent('ods:page-refresh'));
}

export function navigateSubNav(direction: 'prev' | 'next'): void {
  const tabs = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-ods-subnav] a[href]'),
  );
  if (!tabs.length) return;
  const activeIndex = tabs.findIndex((tab) => tab.getAttribute('aria-current') === 'page');
  const start = activeIndex >= 0 ? activeIndex : 0;
  const nextIndex =
    direction === 'next'
      ? (start + 1) % tabs.length
      : (start - 1 + tabs.length) % tabs.length;
  tabs[nextIndex]?.click();
}

type AdminCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  useShortcutModalLock(open);
  const { t } = useTranslation();
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return DASHBOARD_NAV.filter((item) => {
      if (!q) return true;
      const label = t(item.labelKey ?? navLabelKey(item.id));
      return `${label} ${item.href}`.toLowerCase().includes(q);
    }).slice(0, 12);
  }, [query, t]);

  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" closeOnOverlayClick showClose>
        <DialogHeader>
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>Jump to any admin area. Use arrow keys and Enter in the list.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Stack gap="md">
            <SearchInput
              aria-label="Search commands"
              placeholder="Search navigation…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
            <ul className="max-h-64 space-y-1 overflow-y-auto" role="listbox" aria-label="Navigation results">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(item.href);
                    }}
                  >
                    <span className="font-medium text-foreground">{t(item.labelKey ?? navLabelKey(item.id))}</span>
                    <span className="text-xs text-muted-foreground">{item.href}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Stack>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function AdminGlobalShortcuts() {
  const { setOverlayOpen, shortcuts, mode } = useShortcutManager();
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  const globalShortcuts = React.useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: 'global:command-palette',
        combo: 'mod+k',
        description: 'Open command palette',
        scope: 'global',
        allowInInput: false,
        enabled: mode !== 'off',
        onTrigger: (event) => {
          event.preventDefault();
          setPaletteOpen(true);
        },
      },
      {
        id: 'global:focus-search',
        combo: '/',
        description: 'Focus search',
        scope: 'global',
        allowInInput: false,
        enabled: mode !== 'off',
        onTrigger: (event) => {
          event.preventDefault();
          focusPageSearch();
        },
      },
      {
        id: 'global:save-form',
        combo: 'mod+s',
        description: 'Save form',
        scope: 'global',
        allowInInput: true,
        enabled: mode === 'full',
        onTrigger: (event) => {
          const form = document.querySelector('form[data-ods-save-form]');
          if (!form) return;
          event.preventDefault();
          submitPrimarySaveForm();
        },
      },
      {
        id: 'global:find-in-page',
        combo: 'mod+f',
        description: 'Focus page search',
        scope: 'global',
        allowInInput: false,
        enabled: mode === 'full',
        onTrigger: (event) => {
          const target =
            document.querySelector('[data-ods-page-search]') ?? document.querySelector('[data-ods-search]');
          if (!target) return;
          event.preventDefault();
          focusPageSearch();
        },
      },
      {
        id: 'global:shortcut-overlay',
        combo: 'shift+/',
        description: 'Show keyboard shortcuts',
        scope: 'global',
        allowInInput: false,
        enabled: mode !== 'off',
        onTrigger: (event) => {
          event.preventDefault();
          setOverlayOpen(true);
        },
      },
    ],
    [mode, setOverlayOpen],
  );

  const overlayGroups = React.useMemo<ShortcutOverlayGroup[]>(() => {
    const byGroup = new Map<string, Array<{ combo: string; description: string }>>();
    for (const shortcut of shortcuts) {
      const title =
        shortcut.scope === 'global'
          ? 'Global'
          : shortcut.scope === 'page'
            ? 'Page'
            : shortcut.scope === 'table'
              ? 'Table'
              : shortcut.scope === 'form'
                ? 'Form'
                : 'Other';
      const list = byGroup.get(title) ?? [];
      list.push({ combo: shortcut.combo, description: shortcut.description });
      byGroup.set(title, list);
    }
    return Array.from(byGroup.entries()).map(([title, items]) => ({ title, shortcuts: items }));
  }, [shortcuts]);

  return (
    <>
      <ShortcutScope scope="global" shortcuts={globalShortcuts} />
      <AdminCommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ShortcutOverlayBridge groups={overlayGroups} />
    </>
  );
}

const DEFAULT_SHORTCUT_GROUPS: ShortcutOverlayGroup[] = [
  {
    title: 'Global',
    shortcuts: [
      { combo: 'mod+k', description: 'Open command palette' },
      { combo: '/', description: 'Focus search' },
      { combo: 'mod+s', description: 'Save form (when available)' },
      { combo: 'mod+f', description: 'Focus page search' },
      { combo: 'shift+/', description: 'Show this help' },
    ],
  },
  {
    title: 'Page',
    shortcuts: [
      { combo: 'n', description: 'Create new item' },
      { combo: 'r', description: 'Refresh data' },
      { combo: 'arrowleft', description: 'Previous tab' },
      { combo: 'arrowright', description: 'Next tab' },
    ],
  },
];

function ShortcutOverlayBridge({ groups }: { groups: ShortcutOverlayGroup[] }) {
  const { overlayOpen, setOverlayOpen, mode } = useShortcutManager();
  if (mode === 'off') return null;
  const merged =
    groups.length > 0
      ? groups
      : DEFAULT_SHORTCUT_GROUPS;
  return <ShortcutOverlay open={overlayOpen} onOpenChange={setOverlayOpen} groups={merged} />;
}

function AdminFormShortcuts() {
  const { mode } = useShortcutManager();

  const formShortcuts = React.useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: 'form:save',
        combo: 'mod+s',
        description: 'Save form',
        scope: 'form',
        allowInInput: true,
        enabled: mode === 'full',
        onTrigger: (event) => {
          if (!document.querySelector('form[data-ods-save-form]')) return;
          event.preventDefault();
          submitPrimarySaveForm();
        },
      },
    ],
    [mode],
  );

  return <ShortcutScope scope="form" shortcuts={formShortcuts} />;
}

function AdminPageShortcuts() {
  const pathname = usePathname();
  const router = useRouter();
  const config = React.useMemo(() => resolvePageShortcutConfig(pathname), [pathname]);

  const pageShortcuts = React.useMemo<ShortcutDefinition[]>(() => {
    if (!config) return [];
    return [
      {
        id: 'page:new',
        combo: 'n',
        description: 'Create new item',
        scope: 'page',
        enabled: Boolean(config.newHref),
        onTrigger: (event) => {
          if (!config.newHref) return;
          event.preventDefault();
          router.push(config.newHref);
        },
      },
      {
        id: 'page:edit',
        combo: 'e',
        description: 'Edit selected item',
        scope: 'page',
        enabled: config.supportsEdit,
        onTrigger: (event) => {
          event.preventDefault();
          clickPagePrimaryAction('edit');
        },
      },
      {
        id: 'page:delete',
        combo: 'd',
        description: 'Delete (with confirmation)',
        scope: 'page',
        enabled: config.supportsDelete,
        onTrigger: (event) => {
          event.preventDefault();
          clickPagePrimaryAction('delete');
        },
      },
      {
        id: 'page:refresh',
        combo: 'r',
        description: 'Refresh data',
        scope: 'page',
        enabled: config.supportsRefresh,
        onTrigger: (event) => {
          event.preventDefault();
          refreshCurrentPage();
        },
      },
      {
        id: 'page:tab-prev',
        combo: 'arrowleft',
        description: 'Previous tab',
        scope: 'page',
        enabled: config.supportsTabNav,
        onTrigger: (event) => {
          event.preventDefault();
          navigateSubNav('prev');
        },
      },
      {
        id: 'page:tab-next',
        combo: 'arrowright',
        description: 'Next tab',
        scope: 'page',
        enabled: config.supportsTabNav,
        onTrigger: (event) => {
          event.preventDefault();
          navigateSubNav('next');
        },
      },
    ];
  }, [config, router]);

  return <ShortcutScope scope="page" shortcuts={pageShortcuts} enabled={pageShortcuts.length > 0} />;
}

export type AdminShortcutProviderProps = {
  children: React.ReactNode;
};

/** Admin shell shortcut provider — global, page, overlay, and command palette. */
export function AdminShortcutProvider({ children }: AdminShortcutProviderProps) {
  const mode = useAdminShortcutMode();

  return (
    <ShortcutManager mode={mode}>
      <AdminGlobalShortcuts />
      <AdminFormShortcuts />
      <AdminPageShortcuts />
      {children}
    </ShortcutManager>
  );
}

export type UsePageRefreshShortcutOptions = {
  onRefresh: () => void;
};

/** Listen for `R` page refresh when route config enables refresh. */
export function usePageRefreshShortcut({ onRefresh }: UsePageRefreshShortcutOptions) {
  React.useEffect(() => {
    const handler = () => onRefresh();
    window.addEventListener('ods:page-refresh', handler);
    return () => window.removeEventListener('ods:page-refresh', handler);
  }, [onRefresh]);
}

export type UseTableRowShortcutsOptions = {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
};

/** Arrow up/down to move focus across table rows (`data-ods-table-row`). */
export function TableRowShortcutScope({ containerRef, enabled = true }: UseTableRowShortcutsOptions) {
  const shortcuts = React.useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: 'table:row-up',
        combo: 'arrowup',
        description: 'Previous row',
        scope: 'table',
        allowInInput: false,
        onTrigger: (event) => {
          const rows = getTableRows(containerRef.current);
          if (!rows.length) return;
          event.preventDefault();
          focusTableRow(rows, -1);
        },
      },
      {
        id: 'table:row-down',
        combo: 'arrowdown',
        description: 'Next row',
        scope: 'table',
        allowInInput: false,
        onTrigger: (event) => {
          const rows = getTableRows(containerRef.current);
          if (!rows.length) return;
          event.preventDefault();
          focusTableRow(rows, 1);
        },
      },
    ],
    [containerRef],
  );

  return <ShortcutScope scope="table" shortcuts={shortcuts} enabled={enabled} />;
}

function getTableRows(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLElement>('[data-ods-table-row]'));
}

function focusTableRow(rows: HTMLElement[], delta: number) {
  const active = document.activeElement;
  const index = rows.findIndex((row) => row === active || row.contains(active));
  const next = index < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, index + delta));
  rows[next]?.focus();
}

export type PageHeaderActionShortcutProps = {
  combo: string;
  children: React.ReactNode;
};

/** Wrap a page header action to show an ODS shortcut hint. */
export function PageHeaderActionShortcut({ combo, children }: PageHeaderActionShortcutProps) {
  return (
    <Flex gap="sm" align="center">
      {children}
      <ShortcutHint combo={combo} />
    </Flex>
  );
}
