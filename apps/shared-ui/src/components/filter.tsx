import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Select } from './select';
import { Switch } from './switch';
import { Flex } from './layout/flex';
import { Grid } from './layout/grid';
import { Stack } from './layout/stack';

export interface FilterBarProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'children'> {
  children: React.ReactNode;
  /** Render as a non-submitting container (client-side filters). */
  as?: 'form' | 'div';
  className?: string;
}

/** Top-of-page filter shell — stacks on mobile, wraps on tablet+. */
export function FilterBar({ children, className, as = 'form', ...props }: FilterBarProps) {
  const shellClass = cn(
    'w-full max-w-full overflow-x-hidden rounded-lg border border-border-subtle bg-card p-4 shadow-sm',
    className,
  );
  const body = (
    <Flex
      direction="col"
      gap="md"
      align="stretch"
      className="w-full max-w-full min-[769px]:flex-row min-[769px]:flex-wrap min-[769px]:items-end"
    >
      {children}
    </Flex>
  );

  if (as === 'div') {
    return (
      <div className={shellClass} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {body}
      </div>
    );
  }

  return (
    <form className={shellClass} {...props}>
      {body}
    </form>
  );
}

export interface FilterGroupProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6 | 8;
  className?: string;
}

const groupCols: Record<NonNullable<FilterGroupProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 min-[481px]:grid-cols-2',
  3: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-3',
  4: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-4',
  6: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-3 min-[1281px]:grid-cols-6',
  8: 'grid-cols-1 min-[481px]:grid-cols-2 min-[769px]:grid-cols-4 min-[1281px]:grid-cols-8',
};

/** Groups related controls (date range, multi-select row). */
export function FilterGroup({ children, columns = 1, className }: FilterGroupProps) {
  return (
    <Grid cols={1} gap="md" className={cn('min-w-0 flex-1', groupCols[columns], className)}>
      {children}
    </Grid>
  );
}

export interface FilterItemProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

/** Single labeled filter control on the 8px grid. */
export function FilterItem({ label, htmlFor, children, active, className }: FilterItemProps) {
  return (
    <Stack
      gap="xs"
      className={cn(
        'min-w-0 w-full min-[481px]:min-w-[10rem] min-[481px]:max-w-xs',
        active && 'rounded-md ring-1 ring-primary/30 ring-offset-2 ring-offset-background',
        className,
      )}
    >
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </Stack>
  );
}

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean;
}

/** Native date input with ODS control tokens. */
export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => (
    <Input ref={ref} type="date" error={error} className={cn('min-w-0', className)} {...props} />
  ),
);
DatePicker.displayName = 'DatePicker';

export interface DateRangePickerProps {
  fromId: string;
  toId: string;
  fromName?: string;
  toName?: string;
  fromLabel?: string;
  toLabel?: string;
  fromDefaultValue?: string;
  toDefaultValue?: string;
  fromActive?: boolean;
  toActive?: boolean;
  className?: string;
}

/** From / to date pair aligned with other filters. */
export function DateRangePicker({
  fromId,
  toId,
  fromName = 'from',
  toName = 'to',
  fromLabel = 'From',
  toLabel = 'To',
  fromDefaultValue,
  toDefaultValue,
  fromActive,
  toActive,
  className,
}: DateRangePickerProps) {
  return (
    <FilterGroup columns={2} className={className}>
      <FilterItem label={fromLabel} htmlFor={fromId} active={fromActive}>
        <DatePicker id={fromId} name={fromName} defaultValue={fromDefaultValue} />
      </FilterItem>
      <FilterItem label={toLabel} htmlFor={toId} active={toActive}>
        <DatePicker id={toId} name={toName} defaultValue={toDefaultValue} />
      </FilterItem>
    </FilterGroup>
  );
}

export interface FilterCheckboxItemProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  className?: string;
}

export function FilterCheckboxItem({
  id,
  label,
  checked,
  onChange,
  name,
  className,
}: FilterCheckboxItemProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-md border border-border-default bg-background px-3 text-sm text-foreground',
        checked && 'border-primary/40 bg-primary/5',
        className,
      )}
    >
      <Checkbox id={id} name={name} checked={checked} onChange={onChange} className="mt-0" />
      <span>{label}</span>
    </label>
  );
}

export interface FilterSwitchItemProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
}

export function FilterSwitchItem({ id, label, checked, onChange, className }: FilterSwitchItemProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border-default bg-background px-3 text-sm',
        checked && 'border-primary/40 bg-primary/5',
        className,
      )}
    >
      <Switch id={id} checked={checked} onChange={onChange} className="items-center" />
      <span className="font-medium text-foreground">{label}</span>
    </label>
  );
}

export interface FilterActionsProps {
  children: React.ReactNode;
  className?: string;
}

/** Apply / reset / secondary actions — aligned end on desktop. */
export function FilterActions({ children, className }: FilterActionsProps) {
  return (
    <Flex
      gap="sm"
      wrap
      align="center"
      className={cn('w-full shrink-0 min-[769px]:ml-auto min-[769px]:w-auto', className)}
    >
      {children}
    </Flex>
  );
}

export type FilterApplyButtonProps = React.ComponentProps<typeof Button>;

export function FilterApplyButton({ children = 'Apply', className, ...props }: FilterApplyButtonProps) {
  return (
    <Button type="submit" className={cn('min-w-[5.5rem]', className)} {...props}>
      {children}
    </Button>
  );
}

export type FilterResetButtonProps = React.ComponentProps<typeof Button>;

export function FilterResetButton({
  children = 'Reset',
  className,
  variant = 'outline',
  ...props
}: FilterResetButtonProps) {
  return (
    <Button type="button" variant={variant} className={cn('min-w-[5.5rem]', className)} {...props}>
      {children}
    </Button>
  );
}

export { Input as FilterInput, Select as FilterSelect };
