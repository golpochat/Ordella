import { cn } from '../../lib/utils';

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'takeaway', label: 'Takeaway' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'butcher', label: 'Butcher' },
  { value: 'retail', label: 'Retail shop' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'other', label: 'Other' },
] as const;

export type BusinessTypeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function BusinessTypeSelector({ value, onChange, className }: BusinessTypeSelectorProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', className)}>
      {BUSINESS_TYPE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md border px-3 py-2 text-left text-sm transition-colors',
              selected
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border-default bg-background hover:bg-accent',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
