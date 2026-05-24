import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { LocationsService } from '../../tenants/services/locations.service';

/** Public business locations for storefront / customer apps */
@Controller('public/locations')
@UseGuards(TenantGuard)
export class PublicLocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async list(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.locationsService.listPublicLocations(tenant.tenantId);
    return { success: true, data };
  }

  @Get('resolve/:slugOrId')
  async resolve(
    @CurrentTenant() tenant: TenantContext,
    @Param('slugOrId') slugOrId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.locationsService.resolvePublicLocation(
      tenant.tenantId,
      slugOrId,
    );
    return { success: true, data };
  }
}
