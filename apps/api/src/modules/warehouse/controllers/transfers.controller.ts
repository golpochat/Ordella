import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { FilterPaginationDto } from '../../../common/dto';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CreateStockTransferDto, ReceiveStockTransferDto, UpdateStockTransferDto } from '../../inventory/dto';
import { StockTransfersService } from '../../inventory/services';
import { WarehouseService } from '../services';

@Controller('transfers')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
@RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
export class TransfersController {
  constructor(
    private readonly transfers: StockTransfersService,
    private readonly warehouseService: WarehouseService,
  ) {}

  @Get('list')
  async list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: FilterPaginationDto,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.transfers.findAll(tenant, query);
    return { success: true, data };
  }

  @Get(':id')
  async get(
    @CurrentTenant() tenant: TenantContext,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.transfers.findOne(tenant, id);
    return { success: true, data };
  }

  @Post('create')
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateStockTransferDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.transfers.create(tenant, dto);
    if (data.status === 'in_transit') {
      await this.warehouseService.createPickForTransfer(tenant.tenantId, data);
    }
    return { success: true, data };
  }

  @Post('update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: UpdateStockTransferDto & { id: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.transfers.update(tenant, dto.id, dto);
    if (data.status === 'in_transit') {
      await this.warehouseService.createPickForTransfer(tenant.tenantId, data);
    }
    return { success: true, data };
  }

  @Post('receive')
  async receive(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ReceiveStockTransferDto & { transferId: string },
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.transfers.receive(tenant, dto.transferId, dto);
    return { success: true, data };
  }
}
