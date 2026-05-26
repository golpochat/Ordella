export enum SubscriptionSchedule {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PAYMENT_FAILED = 'payment_failed',
}

export enum SubscriptionPlanStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum SubscriptionBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionOrderStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}
