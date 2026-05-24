import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PromotionsPermissionKeys } from '../constants/permission-keys';
import { CreatePromotionApplicationDto } from '../dto/promotion-applications/create-promotion-application.dto';
import { FilterPromotionApplicationDto } from '../dto/promotion-applications/filter-promotion-application.dto';
import { PromotionApplicationResponseDto } from '../dto/promotion-applications/promotion-application-response.dto';
import { PromotionApplicationsService } from '../services/promotion-applications.service';

/** SRS §47 — apply / redeem tracking */
@Controller('promotion-applications')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PromotionApplicationsController {
  constructor(private readonly promotionApplicationsService: PromotionApplicationsService) {}

  @Get()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_APPLICATIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPromotionApplicationDto,
  ): Promise<ApiSuccessResponse<PromotionApplicationResponseDto[]>> {
    const data = await this.promotionApplicationsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_APPLICATIONS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePromotionApplicationDto,
  ): Promise<ApiSuccessResponse<PromotionApplicationResponseDto>> {
    const data = await this.promotionApplicationsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_APPLICATIONS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PromotionApplicationResponseDto>> {
    const data = await this.promotionApplicationsService.findOne(tenant, id);
    return { success: true, data };
  }
}
