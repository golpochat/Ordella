import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { IntegrationEventQueryDto } from '../dto/integration-events/integration-event-query.dto';
import { IntegrationEventResponseDto } from '../dto/integration-events/integration-event-response.dto';

@Injectable()
export class IntegrationEventsService {
  findAll(
    _tenant: TenantContext,
    _query: IntegrationEventQueryDto,
  ): Promise<IntegrationEventResponseDto[]> {
    throw new NotImplementedException('findAll integration events');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<IntegrationEventResponseDto> {
    throw new NotImplementedException('findOne integration event');
  }
}
