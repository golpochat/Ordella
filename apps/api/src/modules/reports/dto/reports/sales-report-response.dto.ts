export class SalesReportResponseDto {
  from!: string;
  to!: string;
  locationId!: string | null;
  totalSales!: string;
  orderCount!: number;
  metrics!: Record<string, unknown>;
}
