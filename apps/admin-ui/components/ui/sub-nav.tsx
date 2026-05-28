'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flex, NavItem } from '@shared-ui';
import { useTranslation } from '@/components/ui/admin-i18n';
import { isNavActive } from '@/components/ui/admin-nav';
import type { SubNavEntry } from '@/lib/navigation';

type SubNavProps = {
  items: SubNavEntry[];
  /** `embedded` — inside `PageHeader` tabs slot (no outer margin/border). */
  variant?: 'standalone' | 'embedded';
};

export function SubNav({ items, variant = 'standalone' }: SubNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const embedded = variant === 'embedded';

  return (
    <nav
      data-ods-subnav=""
      className={embedded ? 'min-w-0 pb-2' : 'mb-6 min-w-0'}
      aria-label={t('shell.sectionNav')}
    >
      <Flex
        gap="sm"
        wrap
        className={embedded ? undefined : 'border-b border-border pb-2'}
      >
        {items.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <NavItem key={item.href} asChild active={active} variant="subnav">
              <Link href={item.href} aria-current={active ? 'page' : undefined}>
                {t(item.labelKey)}
              </Link>
            </NavItem>
          );
        })}
      </Flex>
    </nav>
  );
}
