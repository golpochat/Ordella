import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { AdminPermissionKeys } from '../constants/admin-permission-keys';
import { PromotionsAdminService } from '../services/promotions-admin.service';
import { AdminCreatePromotionDto, AdminUpdatePromotionDto } from '../dto';

@Controller('admin/promotions')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.PROMOTIONS)
export class AdminPromotionsController {
  constructor(private readonly promotionsAdminService: PromotionsAdminService) {}

  @Get()
  async list(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.promotionsAdminService.listPromotions(tenant.tenantId, {});
    return { success: true, data };
  }

  @Post()
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: AdminCreatePromotionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.promotionsAdminService.createPromotion(tenant.tenantId, dto);
    return { success: true, data };
  }

  @Patch(':promotionId')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('promotionId', ParseUUIDPipe) promotionId: string,
    @Body() dto: AdminUpdatePromotionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.promotionsAdminService.updatePromotion(tenant.tenantId, promotionId, dto);
    return { success: true, data };
  }

  @Post(':promotionId/activate')
  async activate(
    @CurrentTenant() tenant: TenantContext,
    @Param('promotionId', ParseUUIDPipe) promotionId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.promotionsAdminService.activatePromotion(tenant.tenantId, promotionId);
    return { success: true, data };
  }

  @Post(':promotionId/deactivate')
  async deactivate(
    @CurrentTenant() tenant: TenantContext,
    @Param('promotionId', ParseUUIDPipe) promotionId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.promotionsAdminService.deactivatePromotion(tenant.tenantId, promotionId);
    return { success: true, data };
  }

  @Get(':promotionId/usage')
  async usage(
    @CurrentTenant() tenant: TenantContext,
    @Param('promotionId', ParseUUIDPipe) promotionId: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.promotionsAdminService.viewPromotionUsage(tenant.tenantId, promotionId);
    return { success: true, data };
  }
}
