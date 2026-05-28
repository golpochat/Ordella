import Link from 'next/link';
import { NavItem } from '@shared-ui';
import { cn } from '@/lib/cn';
import type { DocNavigationGroup } from '@/lib/docs';

type DocsSidebarProps = {
  navigation: DocNavigationGroup[];
  activeSlug: string;
  onNavigate?: () => void;
  className?: string;
};

export function DocsSidebar({ navigation, activeSlug, onNavigate, className }: DocsSidebarProps) {
  return (
    <nav className={cn('space-y-6', className)} aria-label="Documentation">
      {navigation.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">{group.title}</p>
          <ul className="mt-2 space-y-0.5 border-l-2 border-border pl-3">
            {group.docs.map((doc) => {
              const active = activeSlug === doc.slug;
              return (
                <li key={doc.slug}>
                  <NavItem
                    asChild
                    variant="subnav"
                    active={active}
                    className={cn(
                      'w-full justify-start rounded-r-md py-1.5 pl-2 text-sm leading-snug',
                      active
                        ? 'border-l-2 border-primary -ml-[calc(0.75rem+2px)] bg-gray-light pl-[calc(0.5rem+2px)] font-medium text-primary'
                        : 'text-slate hover:text-navy',
                    )}
                  >
                    <Link
                      href={`/docs/${doc.slug}`}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                    >
                      {doc.title}
                    </Link>
                  </NavItem>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
