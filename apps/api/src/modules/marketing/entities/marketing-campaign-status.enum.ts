export enum MarketingCampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
}

export enum MarketingCampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum MarketingCampaignAutomationType {
  BROADCAST = 'broadcast',
  TRIGGER_BASED = 'trigger-based',
  JOURNEY = 'journey',
}

export enum MarketingScheduleType {
  ONE_TIME = 'one-time',
  RECURRING = 'recurring',
}

export enum MarketingCampaignLogStatus {
  SENT = 'sent',
  FAILED = 'failed',
  OPENED = 'opened',
  CLICKED = 'clicked',
  CONVERTED = 'converted',
  UNSUBSCRIBED = 'unsubscribed',
}
