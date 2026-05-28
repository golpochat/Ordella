import { Tag, TagLabel, type TagProps, type TagVariant } from './tag';

/** @deprecated Prefer `Tag` + `TagLabel` with semantic variants (`success`, `error`, etc.). */
const badgeVariantMap = {
  default: 'brand',
  secondary: 'neutral',
  destructive: 'error',
  outline: 'outline',
} as const satisfies Record<string, TagVariant>;

export type BadgeVariant = keyof typeof badgeVariantMap;

const badgeVariants = {
  variants: {
    variant: {
      default: '',
      secondary: '',
      destructive: '',
      outline: '',
    },
  },
};

export interface BadgeProps extends Omit<TagProps, 'variant'> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const mapped = badgeVariantMap[variant ?? 'default'];
  return (
    <Tag variant={mapped} className={className} {...props}>
      <TagLabel>{children}</TagLabel>
    </Tag>
  );
}

export { Badge, badgeVariants };
