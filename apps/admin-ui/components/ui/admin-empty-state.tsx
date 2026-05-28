import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import {
  Button,
  EmptyState,
  EmptyStateIcon,
  type EmptyStateProps,
} from '@shared-ui';

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from '@shared-ui';

export type { EmptyStateProps };

export function EmptyStateLucideIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-6 w-6" aria-hidden />;
}

export type EmptyStateAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

export function EmptyStateActionLink({ label, href, variant = 'primary' }: EmptyStateAction) {
  return (
    <Button asChild variant={variant === 'secondary' ? 'outline' : 'default'}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export type AdminEmptyStateProps = Omit<EmptyStateProps, 'icon'> & {
  icon?: LucideIcon;
};

/** Admin empty state with default inbox icon when none is provided. */
export function AdminEmptyState({ icon: Icon, ...props }: AdminEmptyStateProps) {
  const ResolvedIcon = Icon ?? Inbox;
  return (
    <EmptyState
      icon={
        <EmptyStateIcon>
          <ResolvedIcon className="h-6 w-6" aria-hidden />
        </EmptyStateIcon>
      }
      {...props}
    />
  );
}

/** Compact empty block for nested panels and card sections. */
export function PanelEmpty(props: AdminEmptyStateProps) {
  return <AdminEmptyState size="compact" {...props} />;
}
