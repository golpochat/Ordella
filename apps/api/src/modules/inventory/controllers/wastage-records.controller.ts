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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateWastageRecordDto,
  WastageRecordResponseDto,
} from '../dto/wastage/wastage-record.dto';
import { WastageRecordsService } from '../services/wastage-records.service';

/** SRS §4.3 — wastage logging */
@Controller('wastage-records')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class WastageRecordsController {
  constructor(private readonly wastageRecordsService: WastageRecordsService) {}

  @Get()
  @RequirePermissions('wastage-records:read')
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: PaginationQueryDto,
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
