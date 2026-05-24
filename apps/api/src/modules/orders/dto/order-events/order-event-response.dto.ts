export class OrderEventResponseDto {
  id!: string;
  orderId!: string;
  eventType!: string;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
}
