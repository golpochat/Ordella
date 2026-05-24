/** API Spec §7.2 — tracking point (ERD delivery_tracking; future dedicated table) */
export class DeliveryTrackingPointDto {
  id!: string;
  deliveryTaskId!: string;
  lat!: number;
  lng!: number;
  recordedAt!: Date;
}
