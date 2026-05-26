import { AiActionRequestEntity } from './ai-action-request.entity';
import { AiAutomationSettingEntity } from './ai-automation-setting.entity';
import { AiConversationEntity } from './ai-conversation.entity';
import { AiInsightEntity } from './ai-insight.entity';
import { AiMessageEntity } from './ai-message.entity';
import { AiUsageMetricEntity } from './ai-usage-metric.entity';

export { AiActionRequestEntity } from './ai-action-request.entity';
export type { AiActionStatus } from './ai-action-request.entity';
export { AiAutomationSettingEntity } from './ai-automation-setting.entity';
export { AiConversationEntity } from './ai-conversation.entity';
export { AiInsightEntity } from './ai-insight.entity';
export { AiMessageEntity } from './ai-message.entity';
export { AiUsageMetricEntity } from './ai-usage-metric.entity';

export const AI_ASSISTANT_ENTITIES = [
  AiActionRequestEntity,
  AiAutomationSettingEntity,
  AiConversationEntity,
  AiInsightEntity,
  AiMessageEntity,
  AiUsageMetricEntity,
];
