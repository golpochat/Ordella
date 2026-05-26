import { IsBoolean, IsIn, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendAssistantMessageDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsString()
  message!: string;
}

export class UpdateAutomationSettingDto {
  @IsString()
  automationType!: 'purchase_orders' | 'staffing_templates' | 'marketing_campaigns' | 'dynamic_pricing' | 'notifications' | 'support_replies';

  @IsBoolean()
  isEnabled!: boolean;

  @IsBoolean()
  requiresApproval!: boolean;

  @IsOptional()
  @IsObject()
  thresholds?: Record<string, unknown>;
}

export class ReviewAiActionDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  note?: string;
}

export class AccuracyFeedbackDto {
  @IsUUID()
  messageId!: string;

  @IsString()
  score!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
