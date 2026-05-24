import {
  Body,
  Controller,
  Delete,
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
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { PromotionsPermissionKeys } from '../constants/permission-keys';
import { CreatePromotionConditionDto } from '../dto';
import { FilterPromotionConditionDto } from '../dto';
import { PromotionConditionResponseDto } from '../dto';
import { UpdatePromotionConditionDto } from '../dto';
import { PromotionConditionsService } from '../services';

/** SRS §12 — eligibility rules */
@Controller('promotion-conditions')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PromotionConditionsController {
  constructor(private readonly promotionConditionsService: PromotionConditionsService) {}

  @Get()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_CONDITIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPromotionConditionDto,
  ): Promise<ApiSuccessResponse<PromotionConditionResponseDto[]>> {
    const data = await this.promotionConditionsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_CONDITIONS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePromotionConditionDto,
  ): Promise<ApiSuccessResponse<PromotionConditionResponseDto>> {
    const data = await this.promotionConditionsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_CONDITIONS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PromotionConditionResponseDto>> {
    const data = await this.promotionConditionsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_CONDITIONS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromotionConditionDto,
  ): Promise<ApiSuccessResponse<PromotionConditionResponseDto>> {
    const data = await this.promotionConditionsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_CONDITIONS_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.promotionConditionsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
