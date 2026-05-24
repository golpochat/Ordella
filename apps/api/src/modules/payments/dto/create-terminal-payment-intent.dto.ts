import { IsOptional, IsString, IsUUID } from 'class-validator';

/** POST /payments/terminal/payment-intent */
export class CreateTerminalPaymentIntentDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsUUID()
  terminalId?: string;
}
