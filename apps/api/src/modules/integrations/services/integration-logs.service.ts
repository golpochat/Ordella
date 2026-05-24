import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterIntegrationLogDto } from '../dto';
import { IntegrationLogResponseDto } from '../dto';

@Injectable()
export class IntegrationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterIntegrationLogDto,
  ): Promise<IntegrationLogResponseDto[]> {
    throw new NotImplementedException('findAll integration logs');
  }
}
