import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { CurrentTenant } from '../../../common/decorators';
import { TenantContext } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { PromotionsPermissionKeys } from '../constants/permission-keys';
import { CreatePromotionApplicationDto } from '../dto';
import { FilterPromotionApplicationDto } from '../dto';
import { PromotionApplicationResponseDto } from '../dto';
import { PromotionApplicationsService } from '../services';

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
