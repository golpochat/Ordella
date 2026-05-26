import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateNotificationTemplateDto, PreviewNotificationTemplateDto, TestNotificationTemplateDto } from '../dto';
import { NotificationTemplateResponseDto } from '../dto';
import { UpdateNotificationTemplateDto } from '../dto';
import { NotificationTemplateEntity } from '../entities';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationTemplatesService {
  constructor(
    @InjectRepository(NotificationTemplateEntity)
    private readonly templates: Repository<NotificationTemplateEntity>,
    private readonly notifications: NotificationsService,
  ) {}

  async findAll(
    tenant: TenantContext,
    query: FilterPaginationDto,
  ): Promise<NotificationTemplateResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const rows = await this.templates.find({
      where: { tenantId: tenant.tenantId },
      order: { name: 'ASC', channel: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(
    tenant: TenantContext,
    dto: CreateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    const existing = await this.templates.findOne({
      where: { tenantId: tenant.tenantId, name: dto.name, channel: dto.channel },
    });
    const entity = existing ?? this.templates.create({ tenantId: tenant.tenantId, version: 1 });
    entity.name = dto.name;
    entity.channel = dto.channel;
    entity.subject = dto.subject ?? null;
    entity.content = dto.content;
    entity.isActive = dto.isActive ?? true;
    entity.version = existing ? existing.version + 1 : 1;
    return this.toResponse(await this.templates.save(entity));
  }

  async findOne(tenant: TenantContext, id: string): Promise<NotificationTemplateResponseDto> {
    return this.toResponse(await this.requireTemplate(tenant.tenantId, id));
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.requireTemplate(tenant.tenantId, id);
    if (dto.subject !== undefined) template.subject = dto.subject;
    if (dto.content !== undefined) template.content = dto.content;
    if (dto.isActive !== undefined) template.isActive = dto.isActive;
    template.version += 1;
    return this.toResponse(await this.templates.save(template));
  }

  async preview(tenant: TenantContext, dto: PreviewNotificationTemplateDto) {
    return this.notifications.renderAdHocTemplate(tenant.tenantId, dto.channel, {
      name: dto.name,
      subject: dto.subject ?? null,
      content: dto.content,
    }, dto.variables);
  }

  async testSend(tenant: TenantContext, dto: TestNotificationTemplateDto) {
    const rendered = await this.preview(tenant, dto);
    return this.notifications.sendRenderedNotification(tenant.tenantId, dto.channel, dto.recipient, rendered, {
      ...dto.variables,
      templateName: dto.name,
      testSend: true,
    });
  }

  private async requireTemplate(tenantId: string, id: string) {
    const template = await this.templates.findOne({ where: { tenantId, id } });
    if (!template) throw new NotFoundException('Notification template not found');
    return template;
  }

  private toResponse(template: NotificationTemplateEntity): NotificationTemplateResponseDto {
    return {
      id: template.id,
      tenantId: template.tenantId,
      name: template.name,
      channel: template.channel,
      subject: template.subject,
      content: template.content,
      version: template.version,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
