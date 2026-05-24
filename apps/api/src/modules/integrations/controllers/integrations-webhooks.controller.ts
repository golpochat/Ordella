import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { CreateIntegrationWebhookDto } from '../dto';
import { IntegrationsWebhooksService } from '../services';

/** API Spec §13.1–§13.3 */
@Controller('integrations')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationsWebhooksController {
  constructor(private readonly integrationsWebhooksService: IntegrationsWebhooksService) {}

  @Post('delivery/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async deliveryWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateIntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receiveDeliveryWebhook(tenant, dto);
    return { success: true, data };
  }

  @Post('payments/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async paymentsWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateIntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receivePaymentsWebhook(tenant, dto);
    return { success: true, data };
  }

  @Post('pos/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async posWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateIntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receivePosWebhook(tenant, dto);
    return { success: true, data };
  }
}
