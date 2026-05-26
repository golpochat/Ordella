import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterIntegrationEventDto } from '../dto';
import { IntegrationEventResponseDto } from '../dto';
import { IntegrationEventEntity } from '../entities';

@Injectable()
export class IntegrationEventsService {
  constructor(
    @InjectRepository(IntegrationEventEntity)
    private readonly events: Repository<IntegrationEventEntity>,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterIntegrationEventDto,
  ): Promise<IntegrationEventResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const builder = this.events
      .createQueryBuilder('event')
      .innerJoin('event.integration', 'integration')
      .where('integration.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .orderBy('event.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (query.integrationId) builder.andWhere('event.integration_id = :integrationId', { integrationId: query.integrationId });
    const events = await builder.getMany();
    return events.map((event) => this.toDto(event));
  }

  async findOne(tenant: TenantContext, id: string): Promise<IntegrationEventResponseDto> {
    const event = await this.events
      .createQueryBuilder('event')
      .innerJoin('event.integration', 'integration')
      .where('event.id = :id', { id })
      .andWhere('integration.tenant_id = :tenantId', { tenantId: tenant.tenantId })
      .getOne();
    if (!event) throw new NotFoundException('Integration event not found');
    return this.toDto(event);
  }

  private toDto(event: IntegrationEventEntity): IntegrationEventResponseDto {
    return {
      id: event.id,
      integrationId: event.integrationId,
      eventType: event.eventType,
      externalId: event.externalId,
      payload: event.payload,
      status: event.status,
      processedAt: event.processedAt,
      createdAt: event.createdAt,
    };
  }
}
