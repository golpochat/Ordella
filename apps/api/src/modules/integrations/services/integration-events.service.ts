import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterIntegrationEventDto } from '../dto';
import { IntegrationEventResponseDto } from '../dto';

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
