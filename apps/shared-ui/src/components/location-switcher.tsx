'use client';

import type { LocationOption } from '@shared-utils';
import { setStoredLocationId } from '@shared-utils';

type LocationSwitcherProps = {
  locations: LocationOption[];
  value: string | null;
  onChange: (locationId: string) => void;
  className?: string;
  label?: string;
};

export function LocationSwitcher({
  locations,
  value,
  onChange,
  className,
  label = 'Location',
}: LocationSwitcherProps) {
  if (locations.length <= 1) {
    if (locations.length === 1) {
      return (
        <span className={className ?? 'text-sm text-muted-foreground'}>
          {locations[0]?.name}
        </span>
      );
    }
    return null;
  }

  return (
    <label className={className ?? 'flex items-center gap-2 text-sm'}>
      <span className="text-muted-foreground">{label}</span>
      <select
        className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-2"
        value={value ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          setStoredLocationId(next);
          onChange(next);
        }}
      >
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>
    </label>
  );
}
