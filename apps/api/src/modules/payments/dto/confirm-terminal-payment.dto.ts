import { IsString, IsUUID, MinLength } from 'class-validator';

/** POST /payments/terminal/confirm */
export class ConfirmTerminalPaymentDto {
  @IsUUID()
  orderId!: string;

  @IsString()
  @MinLength(1)
  paymentIntentId!: string;
}
