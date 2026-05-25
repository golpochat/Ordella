import { IntegrationEventEntity } from './integration-event.entity';
import { IntegrationLogEntity } from './integration-log.entity';
import { IntegrationProviderEntity } from './integration-provider.entity';
import { IntegrationEntity } from './integration.entity';
import { WebhookDeliveryLogEntity } from './webhook-delivery-log.entity';
import { WebhookEntity } from './webhook.entity';

export { BaseTenantScopedEntity } from './base-tenant-scoped.entity';
export { BaseTimestampsEntity } from './base-timestamps.entity';
export { IntegrationEventEntity } from './integration-event.entity';
export { IntegrationLogEntity } from './integration-log.entity';
export { IntegrationProviderEntity } from './integration-provider.entity';
export { IntegrationEntity } from './integration.entity';
export { WebhookDeliveryLogEntity } from './webhook-delivery-log.entity';
export { WebhookEntity } from './webhook.entity';

export const INTEGRATIONS_ENTITIES = [
  IntegrationEventEntity,
  IntegrationLogEntity,
  IntegrationProviderEntity,
  IntegrationEntity,
  WebhookDeliveryLogEntity,
  WebhookEntity,
];
