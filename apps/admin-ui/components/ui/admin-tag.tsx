'use client';

import type { InventoryListItem } from '@shared-utils';
import { labelOrderStatus } from '@shared-utils';
import {
  Tag,
  TagCloseButton,
  TagGroup,
  TagIcon,
  TagLabel,
  type TagCloseButtonProps,
  type TagGroupProps,
  type TagIconProps,
  type TagLabelProps,
  type TagProps,
  type TagVariant,
} from '@shared-ui';

export {
  Tag,
  TagCloseButton,
  TagGroup,
  TagIcon,
  TagLabel,
  type TagCloseButtonProps,
  type TagGroupProps,
  type TagIconProps,
  type TagLabelProps,
  type TagProps,
  type TagVariant,
};

/** @deprecated Use `Tag` with semantic variants. */
export { Badge } from '@shared-ui';

const ACTIVE_POSITIVE = new Set(['active', 'completed', 'success', 'paid', 'open', 'fulfilled', 'delivered', 'installed', 'approved', 'healthy', 'fresh', 'balanced', 'published']);
const ACTIVE_NEGATIVE = new Set([
  'failed',
  'cancelled',
  'canceled',
  'refunded',
  'error',
  'critical',
  'high',
  'blocked',
  'rejected',
  'stale',
  'overdue',
  'inactive',
  'disabled',
  'offline',
]);
const ACTIVE_PENDING = new Set(['pending', 'draft', 'paused', 'processing', 'preparing', 'trialing']);

/** Map free-form status strings to ODS semantic tag variants. */
export function inferStatusTagVariant(status: string): TagVariant {
  const normalized = status.toLowerCase().trim();
  if (ACTIVE_NEGATIVE.has(normalized)) return 'error';
  if (ACTIVE_PENDING.has(normalized)) return 'warning';
  if (ACTIVE_POSITIVE.has(normalized)) return 'success';
  return 'neutral';
}

export type StatusTagProps = Omit<TagProps, 'variant'> & {
  label: string;
  variant?: TagVariant;
};

export function StatusTag({ label, variant = 'neutral', ...props }: StatusTagProps) {
  return (
    <Tag variant={variant} {...props}>
      <TagLabel>{label}</TagLabel>
    </Tag>
  );
}

export function OrderStatusTag({ status }: { status: string }) {
  return <StatusTag label={labelOrderStatus(status)} variant={inferStatusTagVariant(status)} />;
}

export function InventoryStatusTag({ status }: { status: InventoryListItem['status'] }) {
  const config: Record<InventoryListItem['status'], { label: string; variant: TagVariant }> = {
    ok: { label: 'In stock', variant: 'success' },
    low: { label: 'Low stock', variant: 'warning' },
    out: { label: 'Out of stock', variant: 'error' },
  };
  const { label, variant } = config[status];
  return <StatusTag label={label} variant={variant} />;
}

export type ActiveStatusTagProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
} & Omit<TagProps, 'variant' | 'children'>;

export function ActiveStatusTag({
  active,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
  ...props
}: ActiveStatusTagProps) {
  return (
    <StatusTag
      label={active ? activeLabel : inactiveLabel}
      variant={active ? 'success' : 'neutral'}
      {...props}
    />
  );
}

export type RemovableTagProps = TagProps & {
  label: string;
  onRemove: () => void;
  removeLabel?: string;
};

export function RemovableTag({ label, onRemove, removeLabel, variant = 'neutral', ...props }: RemovableTagProps) {
  return (
    <Tag variant={variant} {...props}>
      <TagLabel>{label}</TagLabel>
      <TagCloseButton onClick={onRemove} aria-label={removeLabel ?? `Remove ${label}`} />
    </Tag>
  );
}

/** Map legacy shadcn badge variant strings to ODS tag variants. */
export function mapLegacyBadgeVariant(variant?: string): TagVariant {
  switch (variant) {
    case 'default':
      return 'brand';
    case 'destructive':
      return 'error';
    case 'outline':
      return 'outline';
    case 'secondary':
    default:
      return 'neutral';
  }
}
