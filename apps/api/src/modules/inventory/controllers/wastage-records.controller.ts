import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateWastageRecordDto } from '../dto';
import { WastageRecordResponseDto } from '../dto';
import { WastageRecordsService } from '../services';

/** SRS §4.3 — wastage logging */
@Controller('wastage-records')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class WastageRecordsController {
  constructor(private readonly wastageRecordsService: WastageRecordsService) {}

  @Get()
  @RequirePermissions('wastage-records:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<WastageRecordResponseDto[]>> {
    const data = await this.wastageRecordsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('wastage-records:create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateWastageRecordDto,
  ): Promise<ApiSuccessResponse<WastageRecordResponseDto>> {
    const data = await this.wastageRecordsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions('wastage-records:read')
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<WastageRecordResponseDto>> {
    const data = await this.wastageRecordsService.findOne(tenant, id);
    return { success: true, data };
  }
}
