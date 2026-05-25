import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { AuditLogQueryDto } from '../dto';
import { AuditLogEntity } from '../entities';

export type CreateAuditLogInput = {
  tenantId: string;
  userId?: string | null;
  locationId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuditLogListResult = {
  logs: AuditLogEntity[];
  page: number;
  limit: number;
  total: number;
};

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogs: Repository<AuditLogEntity>,
  ) {}

  async record(input: CreateAuditLogInput): Promise<void> {
    await this.auditLogs.save(
      this.auditLogs.create({
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        locationId: input.locationId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      }),
    );
  }

  async list(tenant: TenantContext, query: AuditLogQueryDto): Promise<AuditLogListResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const createdAt =
      query.from && query.to
        ? Between(new Date(query.from), new Date(query.to))
        : query.from
          ? MoreThanOrEqual(new Date(query.from))
          : query.to
            ? LessThanOrEqual(new Date(query.to))
            : undefined;

    const where: FindOptionsWhere<AuditLogEntity> = {
      tenantId: tenant.tenantId,
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.locationId ? { locationId: query.locationId } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(createdAt ? { createdAt } : {}),
    };

    const [logs, total] = await this.auditLogs.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, page, limit, total };
  }

  async getById(tenant: TenantContext, id: string): Promise<AuditLogEntity> {
    const log = await this.auditLogs.findOne({ where: { id, tenantId: tenant.tenantId } });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }
}
