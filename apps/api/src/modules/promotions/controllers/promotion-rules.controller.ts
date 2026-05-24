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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PromotionsPermissionKeys } from '../constants/permission-keys';
import { CreatePromotionRuleDto } from '../dto/promotion-rules/create-promotion-rule.dto';
import { FilterPromotionRuleDto } from '../dto/promotion-rules/filter-promotion-rule.dto';
import { PromotionRuleResponseDto } from '../dto/promotion-rules/promotion-rule-response.dto';
import { UpdatePromotionRuleDto } from '../dto/promotion-rules/update-promotion-rule.dto';
import { PromotionRulesService } from '../services/promotion-rules.service';

/** SRS §12 / §47 — stacking and rules engine */
@Controller('promotion-rules')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PromotionRulesController {
  constructor(private readonly promotionRulesService: PromotionRulesService) {}

  @Get()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_RULES_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPromotionRuleDto,
  ): Promise<ApiSuccessResponse<PromotionRuleResponseDto[]>> {
    const data = await this.promotionRulesService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_RULES_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePromotionRuleDto,
  ): Promise<ApiSuccessResponse<PromotionRuleResponseDto>> {
    const data = await this.promotionRulesService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_RULES_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PromotionRuleResponseDto>> {
    const data = await this.promotionRulesService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_RULES_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromotionRuleDto,
  ): Promise<ApiSuccessResponse<PromotionRuleResponseDto>> {
    const data = await this.promotionRulesService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTION_RULES_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.promotionRulesService.remove(tenant, id);
    return { success: true, data: null };
  }
}
