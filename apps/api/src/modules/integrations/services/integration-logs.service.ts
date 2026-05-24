import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { IntegrationLogQueryDto } from '../dto/integration-logs/integration-log-query.dto';
import { IntegrationLogResponseDto } from '../dto/integration-logs/integration-log-response.dto';

@Injectable()
export class IntegrationLogsService {
  findAll(
    _tenant: TenantContext,
    _query: IntegrationLogQueryDto,
  ): Promise<IntegrationLogResponseDto[]> {
    throw new NotImplementedException('findAll integration logs');
  }
}
