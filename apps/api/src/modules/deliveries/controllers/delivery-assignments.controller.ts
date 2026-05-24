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
import { ApiSuccessResponse } from '../../../common/interfaces/api-response.interface';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { DeliveryPermissionKeys } from '../constants/permission-keys';
import { CreateDeliveryAssignmentDto } from '../dto/delivery-assignments/create-delivery-assignment.dto';
import { FilterDeliveryAssignmentDto } from '../dto/delivery-assignments/filter-delivery-assignment.dto';
import { DeliveryAssignmentResponseDto } from '../dto/delivery-assignments/delivery-assignment-response.dto';
import { UpdateDeliveryAssignmentDto } from '../dto/delivery-assignments/update-delivery-assignment.dto';
import { DeliveryAssignmentsService } from '../services/delivery-assignments.service';

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
