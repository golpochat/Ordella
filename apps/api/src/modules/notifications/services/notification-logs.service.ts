import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterNotificationLogDto } from '../dto';
import { NotificationLogResponseDto } from '../dto';
import { NotificationLogEntity } from '../entities';

@Injectable()
export class NotificationLogsService {
  constructor(
    @InjectRepository(NotificationLogEntity)
    private readonly logs: Repository<NotificationLogEntity>,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterNotificationLogDto,
  ): Promise<NotificationLogResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const rows = await this.logs.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.notificationId ? { notificationId: query.notificationId } : {}),
        ...(query.channelId ? { channelId: query.channelId } : {}),
      },
      relations: { notification: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      notificationId: row.notificationId,
      channelId: row.channelId,
      status: row.status,
      providerResponse: row.providerResponse,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
    }));
  }
}
