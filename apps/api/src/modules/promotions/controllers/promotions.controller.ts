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
import { FilterPaginationDto } from '../../../common/dto';
import { PromotionsPermissionKeys } from '../constants/permission-keys';
import { CreatePromotionDto } from '../dto';
import { PromotionResponseDto } from '../dto';
import { UpdatePromotionDto } from '../dto';
import { PromotionsCrudService } from '../services/promotions-crud.service';

/** API Spec §9.1 */
@Controller('promotions')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsCrudService) {}

  @Get()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTIONS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<PromotionResponseDto[]>> {
    const data = await this.promotionsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(PromotionsPermissionKeys.PROMOTIONS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreatePromotionDto,
  ): Promise<ApiSuccessResponse<PromotionResponseDto>> {
    const data = await this.promotionsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTIONS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<PromotionResponseDto>> {
    const data = await this.promotionsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTIONS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<ApiSuccessResponse<PromotionResponseDto>> {
    const data = await this.promotionsService.update(tenant, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequirePermissions(PromotionsPermissionKeys.PROMOTIONS_DELETE)
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.promotionsService.remove(tenant, id);
    return { success: true, data: null };
  }
}
