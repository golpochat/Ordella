import { IsEmail, IsEnum, IsObject, IsOptional } from 'class-validator';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';

export class UpdateBillingDto {
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsObject()
  paymentMethod?: Record<string, unknown>;
}
