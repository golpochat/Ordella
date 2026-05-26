import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterIntegrationLogDto } from '../dto';
import { IntegrationLogResponseDto } from '../dto';
import { IntegrationLogEntity } from '../entities';

@Injectable()
export class IntegrationLogsService {
  constructor(
    @InjectRepository(IntegrationLogEntity)
    private readonly logs: Repository<IntegrationLogEntity>,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterIntegrationLogDto,
  ): Promise<IntegrationLogResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const where: FindOptionsWhere<IntegrationLogEntity> = { tenantId: tenant.tenantId };
    if (query.integrationId) where.integrationId = query.integrationId;
    if (query.level) where.level = query.level;
    const logs = await this.logs.find({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return logs.map((log) => ({
      id: log.id,
      tenantId: log.tenantId,
      integrationId: log.integrationId,
      level: log.level,
      action: log.action,
      message: log.message,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));
  }
}
