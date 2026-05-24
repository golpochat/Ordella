export class InventoryReportResponseDto {
  from!: string;
  to!: string;
  locationId!: string | null;
  metrics!: Record<string, unknown>;
}
