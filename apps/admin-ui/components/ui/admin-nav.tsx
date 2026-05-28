import type { LucideIcon } from 'lucide-react';
import {
  Divider,
  NavIcon,
  NavItem,
  NavGroup,
  NavSection,
  Sidebar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type SidebarNavItem,
  type SidebarSectionConfig,
} from '@shared-ui';
import { navLabelKey, type DashboardNavEntry } from '@/lib/navigation';

export {
  Divider,
  NavIcon,
  NavItem,
  NavGroup,
  NavSection,
  Sidebar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  type SidebarNavItem,
  type SidebarSectionConfig,
};

export type AdminNavGroupDef = {
  id: string;
  /** i18n key under `navGroups.*` (defaults to `navGroups.{id}`). */
  titleKey?: string;
  itemIds: string[];
};

export function createNavIcon(Icon: LucideIcon) {
  return <NavIcon icon={<Icon className="h-5 w-5" aria-hidden />} />;
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavRouter = { push: (href: string) => void };

export function toSidebarNavItem(
  entry: DashboardNavEntry,
  pathname: string,
  router: NavRouter,
  translate: (key: string) => string,
): SidebarNavItem {
  const labelKey = entry.labelKey ?? navLabelKey(entry.id);
  return {
    id: entry.id,
    label: translate(labelKey),
    href: entry.href,
    active: isNavActive(pathname, entry.href),
    icon: createNavIcon(entry.icon),
    onClick: () => router.push(entry.href),
  };
}

export function buildSidebarSections(
  nav: DashboardNavEntry[],
  groups: AdminNavGroupDef[],
  pathname: string,
  router: NavRouter,
  translate: (key: string) => string,
): SidebarSectionConfig[] {
  const navById = new Map(nav.map((item) => [item.id, item]));
  const assigned = new Set<string>();

  const grouped: SidebarSectionConfig[] = groups
    .map((group) => {
      const items = group.itemIds
        .filter((id) => navById.has(id))
        .map((id) => {
          assigned.add(id);
          return toSidebarNavItem(navById.get(id)!, pathname, router, translate);
        });

      const titleKey = group.titleKey ?? `navGroups.${group.id}`;
      return { id: group.id, title: translate(titleKey), items, collapsible: true };
    })
    .filter((section) => section.items.length > 0);

  const remaining = nav
    .filter((item) => !assigned.has(item.id))
    .map((item) => toSidebarNavItem(item, pathname, router, translate));

  if (remaining.length > 0) {
    grouped.push({
      id: 'more',
      title: translate('navGroups.more'),
      items: remaining,
      collapsible: true,
    });
  }

  return grouped;
}
