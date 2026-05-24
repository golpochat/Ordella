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
import { JwtAuthGuard } from '../../auth';
import { RbacGuard } from '../../auth';
import { RequirePermissions } from '../../auth';
import { DeliveryPermissionKeys } from '../constants/permission-keys';
import { CreateDeliveryAssignmentDto } from '../dto';
import { FilterDeliveryAssignmentDto } from '../dto';
import { DeliveryAssignmentResponseDto } from '../dto';
import { UpdateDeliveryAssignmentDto } from '../dto';
import { DeliveryAssignmentsService } from '../services';

/** SRS §28 — manual / auto driver assignments */
@Controller('delivery-assignments')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DeliveryAssignmentsController {
  constructor(private readonly deliveryAssignmentsService: DeliveryAssignmentsService) {}

  @Get()
  @RequirePermissions(DeliveryPermissionKeys.DELIVERY_ASSIGNMENTS_READ)
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterDeliveryAssignmentDto,
  ): Promise<ApiSuccessResponse<DeliveryAssignmentResponseDto[]>> {
    const data = await this.deliveryAssignmentsService.findAll(tenant, query);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions(DeliveryPermissionKeys.DELIVERY_ASSIGNMENTS_CREATE)
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateDeliveryAssignmentDto,
  ): Promise<ApiSuccessResponse<DeliveryAssignmentResponseDto>> {
    const data = await this.deliveryAssignmentsService.create(tenant, dto);
    return { success: true, data };
  }

  @Get(':id')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERY_ASSIGNMENTS_READ)
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<DeliveryAssignmentResponseDto>> {
    const data = await this.deliveryAssignmentsService.findOne(tenant, id);
    return { success: true, data };
  }

  @Patch(':id')
  @RequirePermissions(DeliveryPermissionKeys.DELIVERY_ASSIGNMENTS_UPDATE)
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeliveryAssignmentDto,
  ): Promise<ApiSuccessResponse<DeliveryAssignmentResponseDto>> {
    const data = await this.deliveryAssignmentsService.update(tenant, id, dto);
    return { success: true, data };
  }
}
