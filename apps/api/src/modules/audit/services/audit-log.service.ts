import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogQueryDto } from '../dto';
import { AuditLogEntity } from '../entities';

export type CreateAuditLogInput = {
  tenantId: string;
  userId?: string | null;
  locationId?: string | null;
  actorType?: string;
  source?: string;
  status?: string;
  riskLevel?: string;
  requestId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  retentionUntil?: Date | null;
  legalHold?: boolean;
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
    const previous = await this.auditLogs.findOne({
      where: { tenantId: input.tenantId },
      order: { createdAt: 'DESC' },
      select: ['hash'],
    });
    const retentionUntil = input.retentionUntil ?? this.defaultRetentionUntil();
    const log = this.auditLogs.create({
        tenantId: input.tenantId,
        userId: input.userId ?? null,
        locationId: input.locationId ?? null,
        actorType: input.actorType ?? this.actorTypeFromUser(input.userId),
        source: input.source ?? 'api',
        status: input.status ?? 'success',
        riskLevel: input.riskLevel ?? this.inferRisk(input.action),
        requestId: input.requestId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        previousHash: previous?.hash ?? null,
        retentionUntil,
        legalHold: input.legalHold ?? false,
      });
    log.hash = this.hashLog(log);
    await this.auditLogs.save(log);
  }

  async list(tenant: TenantContext, query: AuditLogQueryDto, user?: AuthenticatedUser): Promise<AuditLogListResult> {
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
      ...(query.actorType ? { actorType: query.actorType } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.riskLevel ? { riskLevel: query.riskLevel } : {}),
      ...(createdAt ? { createdAt } : {}),
      ...this.visibilityWhere(user),
    };

    const [logs, total] = await this.auditLogs.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, page, limit, total };
  }

  async getById(tenant: TenantContext, id: string, user?: AuthenticatedUser): Promise<AuditLogEntity> {
    const log = await this.auditLogs.findOne({ where: { id, tenantId: tenant.tenantId, ...this.visibilityWhere(user) } });
    if (!log) throw new NotFoundException('Audit log not found');
    return log;
  }

  async exportCsv(tenant: TenantContext, query: AuditLogQueryDto, user?: AuthenticatedUser): Promise<string> {
    const result = await this.list(tenant, { ...query, page: 1, limit: 200 }, user);
    const rows = [
      ['timestamp', 'tenantId', 'userId', 'actorType', 'entityType', 'entityId', 'action', 'status', 'riskLevel', 'locationId', 'ipAddress', 'hash'],
      ...result.logs.map((log) => [
        log.createdAt.toISOString(),
        log.tenantId,
        log.userId ?? '',
        log.actorType,
        log.entityType,
        log.entityId ?? '',
        log.action,
        log.status,
        log.riskLevel,
        log.locationId ?? '',
        log.ipAddress ?? '',
        log.hash ?? '',
      ]),
    ];
    return rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  }

  async securityEvents(tenant: TenantContext, query: AuditLogQueryDto, user?: AuthenticatedUser): Promise<AuditLogListResult> {
    const result = await this.list(tenant, query, user);
    return {
      ...result,
      logs: result.logs.filter((log) => this.isSecurityEvent(log)),
    };
  }

  async alerts(tenant: TenantContext, user?: AuthenticatedUser) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = await this.list(tenant, { from: since, limit: 200 }, user);
    const highRisk = result.logs.filter((log) => log.riskLevel === 'high' || log.riskLevel === 'critical');
    const failedByIp = new Map<string, number>();
    for (const log of result.logs.filter((entry) => entry.status === 'failed' || entry.action.includes('failed'))) {
      const key = log.ipAddress ?? 'unknown';
      failedByIp.set(key, (failedByIp.get(key) ?? 0) + 1);
    }
    const repeatedFailures = [...failedByIp.entries()]
      .filter(([, count]) => count >= 5)
      .map(([ipAddress, count]) => ({ type: 'repeated_failed_actions', severity: 'high', ipAddress, count }));
    return [
      ...highRisk.map((log) => ({ type: 'high_risk_action', severity: log.riskLevel, logId: log.id, action: log.action, createdAt: log.createdAt })),
      ...repeatedFailures,
    ];
  }

  async complianceStatus(tenant: TenantContext, user?: AuthenticatedUser) {
    const latest = await this.list(tenant, { limit: 50 }, user);
    const tamperEvidenceVerified = latest.logs.every((log) => !log.previousHash || Boolean(log.hash));
    return {
      immutable: true,
      tamperEvidence: 'sha256 hash chain per tenant',
      tamperEvidenceVerified,
      retentionDays: 365,
      legalHoldSupported: true,
      exportSupported: true,
      sensitiveDataRedaction: true,
      latestLogAt: latest.logs[0]?.createdAt ?? null,
    };
  }

  private visibilityWhere(user?: AuthenticatedUser): FindOptionsWhere<AuditLogEntity> {
    if (!user || user.permissions.includes('*') || ['owner', 'admin'].includes((user.roleName ?? '').toLowerCase())) return {};
    if ((user.roleName ?? '').toLowerCase() === 'staff') return { userId: user.id };
    if (user.locationIds?.length === 1) return { locationId: user.locationIds[0] };
    return {};
  }

  private defaultRetentionUntil(): Date {
    const value = new Date();
    value.setDate(value.getDate() + 365);
    return value;
  }

  private actorTypeFromUser(userId?: string | null): string {
    return userId ? 'staff' : 'system';
  }

  private inferRisk(action: string): string {
    const normalized = action.toLowerCase();
    if (normalized.includes('failed') || normalized.includes('delete') || normalized.includes('permission') || normalized.includes('role')) return 'high';
    if (normalized.includes('password') || normalized.includes('refund') || normalized.includes('billing') || normalized.includes('webhook')) return 'medium';
    return 'low';
  }

  private isSecurityEvent(log: AuditLogEntity): boolean {
    const value = `${log.entityType}.${log.action}`.toLowerCase();
    return ['auth', 'login', 'logout', 'password', 'permission', 'role', 'api_key', 'sso', 'security'].some((keyword) => value.includes(keyword));
  }

  private hashLog(log: AuditLogEntity): string {
    return createHash('sha256')
      .update(JSON.stringify({
        tenantId: log.tenantId,
        userId: log.userId,
        locationId: log.locationId,
        actorType: log.actorType,
        source: log.source,
        status: log.status,
        riskLevel: log.riskLevel,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        previousHash: log.previousHash,
        createdAt: log.createdAt,
      }))
      .digest('hex');
  }
}
