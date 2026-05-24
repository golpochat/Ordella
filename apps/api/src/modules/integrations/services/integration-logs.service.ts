import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterIntegrationLogDto } from '../dto/integration-logs/filter-integration-log.dto';
import { IntegrationLogResponseDto } from '../dto/integration-logs/integration-log-response.dto';

@Injectable()
export class IntegrationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: FilterIntegrationLogDto,
  ): Promise<IntegrationLogResponseDto[]> {
    throw new NotImplementedException('findAll integration logs');
  }
}
