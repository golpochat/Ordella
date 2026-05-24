import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { SubscriptionPlan } from '../../onboarding/enums/subscription-plan.enum';

const PLAN_IDS = Object.values(SubscriptionPlan);

export class SubscribePlanDto {
  @IsIn(PLAN_IDS)
  planId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  paymentMethodId?: string;
}

export class ChangePlanDto {
  @IsIn(PLAN_IDS)
  planId!: string;
}

export class AttachPaymentMethodDto {
  @IsString()
  @MinLength(1)
  paymentMethodId!: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;
}

export class BillingPortalSessionDto {
  @IsOptional()
  @IsString()
  returnUrl?: string;
}

export class BillingSubscriptionCheckoutDto {
  @IsIn(PLAN_IDS)
  planId!: string;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
