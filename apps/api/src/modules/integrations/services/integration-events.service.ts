import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterIntegrationEventDto } from '../dto/integration-events/filter-integration-event.dto';
import { IntegrationEventResponseDto } from '../dto/integration-events/integration-event-response.dto';

@Injectable()
export class IntegrationEventsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterIntegrationEventDto,
  ): Promise<IntegrationEventResponseDto[]> {
    throw new NotImplementedException('findAll integration events');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<IntegrationEventResponseDto> {
    throw new NotImplementedException('findOne integration event');
  }
}
