import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CreateWebhookDto, TestWebhookDto, UpdateWebhookDto } from '../dto';
import { WebhooksService } from '../services/webhooks.service';

@Controller('webhooks')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Get()
  @RequirePermissions('integrations:read')
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.webhooks.list(tenant);
    return { success: true, data };
  }

  @Get('logs')
  @RequirePermissions('integration-logs:read')
  async logs(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.webhooks.listLogs(tenant);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('integrations:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateWebhookDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.webhooks.create(tenant, dto);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions('integrations:update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.webhooks.update(tenant, id, dto);
    return { success: true, data };
  }

  @Post(':id/disable')
  @RequirePermissions('integrations:update')
  async disable(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.webhooks.disable(tenant, id);
    return { success: true, data };
  }

  @Post(':id/rotate-secret')
  @RequirePermissions('integrations:update')
  async rotateSecret(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.webhooks.rotateSecret(tenant, id);
    return { success: true, data };
  }

  @Post(':id/test')
  @RequirePermissions('integrations:update')
  async test(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestWebhookDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.webhooks.test(tenant, id, dto);
    return { success: true, data };
  }
}
