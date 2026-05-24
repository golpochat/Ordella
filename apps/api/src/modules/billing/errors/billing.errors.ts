import { BadRequestException, ForbiddenException } from '@nestjs/common';

export class PlanLimitExceededError extends ForbiddenException {
  constructor(message: string) {
    super({ code: 'PLAN_LIMIT_EXCEEDED', message });
  }
}

export class PlanDowngradeNotAllowedError extends BadRequestException {
  constructor(message: string) {
    super({ code: 'PLAN_DOWNGRADE_NOT_ALLOWED', message });
  }
}

export class BillingNotConfiguredError extends BadRequestException {
  constructor(message = 'Stripe billing is not configured') {
    super({ code: 'BILLING_NOT_CONFIGURED', message });
  }
}
