import { Input } from '../input';
import { cn } from '../../lib/utils';

export type LocationFormValues = {
  locationName: string;
  address: string;
  phone: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
};

export type LocationFormProps = {
  values: LocationFormValues;
  onChange: (patch: Partial<LocationFormValues>) => void;
  className?: string;
};

export function LocationForm({ values, onChange, className }: LocationFormProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="locationName">
          Location name
        </label>
        <Input
          id="locationName"
          value={values.locationName}
          onChange={(e) => onChange({ locationName: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="address">
          Address
        </label>
        <Input
          id="address"
          value={values.address}
          onChange={(e) => onChange({ address: e.target.value })}
          placeholder="Street, city, postcode"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="phone">
          Phone
        </label>
        <Input
          id="phone"
          value={values.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Fulfillment</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.pickupEnabled}
            onChange={(e) => onChange({ pickupEnabled: e.target.checked })}
          />
          Pickup enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.deliveryEnabled}
            onChange={(e) => onChange({ deliveryEnabled: e.target.checked })}
          />
          Delivery enabled
        </label>
      </fieldset>
    </div>
  );
}
