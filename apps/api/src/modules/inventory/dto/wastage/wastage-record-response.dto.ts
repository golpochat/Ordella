export class WastageRecordResponseDto {
  id!: string;
  tenantId!: string;
  stockItemId!: string;
  locationId!: string;
  quantity!: string;
  reason!: string | null;
  recordedBy!: string | null;
  createdAt!: Date;
  updatedAt!: Date | null;
}
