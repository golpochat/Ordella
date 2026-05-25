import { Controller, createParamDecorator, ExecutionContext, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { TENANT_CONTEXT_KEY } from '../../../common/constants/tenant-context-key';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { ApiKeyAuthGuard, RequireApiKeyScopes } from '../../auth';
import { IntegrationPublicApiService } from '../services';

const CurrentApiTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = ctx.switchToHttp().getRequest<{ [TENANT_CONTEXT_KEY]?: TenantContext }>();
    return request[TENANT_CONTEXT_KEY]!;
  },
);

@Controller('api')
@UseGuards(ApiKeyAuthGuard)
export class IntegrationPublicApiController {
  constructor(private readonly publicApi: IntegrationPublicApiService) {}

  @Get('orders')
  @RequireApiKeyScopes('orders.read')
  async orders(@CurrentApiTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.publicApi.listOrders(tenant.tenantId);
    return { success: true, data };
  }

  @Get('orders/:id')
  @RequireApiKeyScopes('orders.read')
  async order(
    @CurrentApiTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.publicApi.getOrder(tenant.tenantId, id);
    return { success: true, data };
  }

  @Get('catalog')
  @RequireApiKeyScopes('catalog.read')
  async catalog(@CurrentApiTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.publicApi.catalog(tenant.tenantId);
    return { success: true, data };
  }

  @Get('items/:id')
  @RequireApiKeyScopes('catalog.read')
  async item(
    @CurrentApiTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.publicApi.getItem(tenant.tenantId, id);
    return { success: true, data };
  }

  @Get('inventory')
  @RequireApiKeyScopes('inventory.read')
  async inventory(@CurrentApiTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.publicApi.listInventory(tenant.tenantId);
    return { success: true, data };
  }

  @Get('customers')
  @RequireApiKeyScopes('customers.read')
  async customers(@CurrentApiTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.publicApi.listCustomers(tenant.tenantId);
    return { success: true, data };
  }

  @Get('customers/:id')
  @RequireApiKeyScopes('customers.read')
  async customer(
    @CurrentApiTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.publicApi.getCustomer(tenant.tenantId, id);
    return { success: true, data };
  }

  @Get('locations')
  @RequireApiKeyScopes('locations.read')
  async locations(@CurrentApiTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.publicApi.listLocations(tenant.tenantId);
    return { success: true, data };
  }
}
