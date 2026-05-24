import { IsOptional, IsUUID } from 'class-validator';

export class AcknowledgeOrderDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
