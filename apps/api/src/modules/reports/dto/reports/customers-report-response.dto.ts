export class CustomersReportResponseDto {
  from!: string;
  to!: string;
  metrics!: Record<string, unknown>;
}
