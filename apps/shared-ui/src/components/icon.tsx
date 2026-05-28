import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Crown,
  Gift,
  Home,
  Info,
  ListChecks,
  ListOrdered,
  Menu,
  Minus,
  Settings,
  ShoppingCart,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type IconName =
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'check'
  | 'minus'
  | 'shopping-cart'
  | 'home'
  | 'list-ordered'
  | 'list-checks'
  | 'gift'
  | 'crown'
  | 'user'
  | 'settings'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

const ICONS: Record<IconName, LucideIcon> = {
  menu: Menu,
  close: X,
  'chevron-down': ChevronDown,
  check: Check,
  minus: Minus,
  'shopping-cart': ShoppingCart,
  home: Home,
  'list-ordered': ListOrdered,
  'list-checks': ListChecks,
  gift: Gift,
  crown: Crown,
  user: User,
  settings: Settings,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const sizeClass: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name?: IconName;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  decorative?: boolean;
  label?: string;
}

/** ODS icon primitive with tokenized names and sizes. */
export function Icon({
  name,
  icon,
  size = 'md',
  decorative = true,
  label,
  className,
  ...props
}: IconProps) {
  const Resolved = icon ?? (name ? ICONS[name] : null);
  if (!Resolved) return null;
  return (
    <Resolved
      className={cn(sizeClass[size], className)}
      aria-hidden={decorative ? true : undefined}
      aria-label={!decorative ? label : undefined}
      role={!decorative ? 'img' : undefined}
      {...props}
    />
  );
}

