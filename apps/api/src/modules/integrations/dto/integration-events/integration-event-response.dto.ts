import { IntegrationEventStatus } from '../../enums/integration-event-status.enum';

export class IntegrationEventResponseDto {
  id!: string;
  integrationId!: string;
  eventType!: string;
  externalId!: string | null;
  payload!: Record<string, unknown>;
  status!: IntegrationEventStatus;
  processedAt!: Date | null;
  createdAt!: Date;
}
