export enum SubscriptionSchedule {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  PAYMENT_FAILED = 'payment_failed',
}

export enum SubscriptionOrderStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}
