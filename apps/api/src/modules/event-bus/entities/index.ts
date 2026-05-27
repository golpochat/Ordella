import { EventConsumerOffsetEntity } from './event-consumer-offset.entity';
import { EventDeadLetterEntity } from './event-dead-letter.entity';
import { EventSchemaEntity } from './event-schema.entity';
import { EventStoreRecordEntity } from './event-store-record.entity';
import { EventStreamMetricEntity } from './event-stream-metric.entity';
import { EventSubscriptionEntity } from './event-subscription.entity';
import { EventTopicEntity } from './event-topic.entity';

export { EventConsumerOffsetEntity } from './event-consumer-offset.entity';
export { EventDeadLetterEntity } from './event-dead-letter.entity';
export { EventSchemaEntity } from './event-schema.entity';
export { EventStoreRecordEntity } from './event-store-record.entity';
export type { EventProducer } from './event-store-record.entity';
export { EventStreamMetricEntity } from './event-stream-metric.entity';
export { EventSubscriptionEntity } from './event-subscription.entity';
export type { EventConsumerType } from './event-subscription.entity';
export { EventTopicEntity } from './event-topic.entity';
export type { EventTopicKey } from './event-topic.entity';

export const EVENT_BUS_ENTITIES = [
  EventConsumerOffsetEntity,
  EventDeadLetterEntity,
  EventSchemaEntity,
  EventStoreRecordEntity,
  EventStreamMetricEntity,
  EventSubscriptionEntity,
  EventTopicEntity,
];
