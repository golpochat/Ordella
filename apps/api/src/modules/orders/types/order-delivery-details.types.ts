/** Snapshot of delivery instructions stored on the order (JSONB). */
export interface OrderDeliveryDetails {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  postalCode?: string | null;
  instructions?: string | null;
  contactPhone?: string | null;
}
