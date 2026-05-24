import { IntegrationEventEntity } from './integration-event.entity';
import { IntegrationLogEntity } from './integration-log.entity';
import { IntegrationProviderEntity } from './integration-provider.entity';
import { IntegrationEntity } from './integration.entity';

export { IntegrationEventEntity } from './integration-event.entity';
export { IntegrationLogEntity } from './integration-log.entity';
export { IntegrationProviderEntity } from './integration-provider.entity';
export { IntegrationEntity } from './integration.entity';

export const INTEGRATIONS_ENTITIES = [
  IntegrationProviderEntity,
  IntegrationEntity,
  IntegrationEventEntity,
  IntegrationLogEntity,
];
