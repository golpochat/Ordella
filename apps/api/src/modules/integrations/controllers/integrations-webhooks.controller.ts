import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { IntegrationsPermissionKeys } from '../constants/permission-keys';
import { IntegrationWebhookDto } from '../dto/integrations/integration-webhook.dto';
import { IntegrationsWebhooksService } from '../services/integrations.service';

/** API Spec §13.1–§13.3 */
@Controller('integrations')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class IntegrationsWebhooksController {
  constructor(private readonly integrationsWebhooksService: IntegrationsWebhooksService) {}

  @Post('delivery/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async deliveryWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: IntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receiveDeliveryWebhook(tenant, dto);
    return { success: true, data };
  }

  @Post('payments/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async paymentsWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: IntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receivePaymentsWebhook(tenant, dto);
    return { success: true, data };
  }

  @Post('pos/webhook')
  @RequirePermissions(IntegrationsPermissionKeys.INTEGRATION_WEBHOOKS_RECEIVE)
  async posWebhook(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: IntegrationWebhookDto,
  ): Promise<ApiSuccessResponse<{ received: boolean }>> {
    const data = await this.integrationsWebhooksService.receivePosWebhook(tenant, dto);
    return { success: true, data };
  }
}
