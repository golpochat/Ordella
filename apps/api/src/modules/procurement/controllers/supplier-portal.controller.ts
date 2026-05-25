import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenant } from '../../../common/decorators';
import { TenantGuard } from '../../../common/guards';
import { ApiSuccessResponse, TenantContext } from '../../../common/interfaces';
import { AdminPermissionKeys } from '../../admin/constants/admin-permission-keys';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { CurrentSupplier } from '../decorators/current-supplier.decorator';
import {
  SupplierCatalogUpdateDto,
  SupplierLoginDto,
  SupplierPasswordResetDto,
  SupplierProfileUpdateDto,
  SupplierPurchaseOrderActionDto,
  SupplierSendMessageDto,
  SupplierUpdateDeliveryDto,
  SupplierUpdatePasswordDto,
} from '../dto';
import { SupplierAuthGuard } from '../guards/supplier-auth.guard';
import { SupplierPortalService } from '../services';
import { SupplierAuthPayload } from '../types/supplier-auth-payload';

@Controller('supplier')
export class SupplierPortalController {
  constructor(private readonly portal: SupplierPortalService) {}

  @Post('login')
  @UseGuards(TenantGuard)
  async login(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: SupplierLoginDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.login(tenant, dto);
    return { success: true, data };
  }

  @Post('password-reset')
  @UseGuards(TenantGuard)
  async requestPasswordReset(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: SupplierPasswordResetDto,
  ): Promise<ApiSuccessResponse<{ requested: boolean }>> {
    await this.portal.requestPasswordReset(tenant, dto);
    return { success: true, data: { requested: true } };
  }

  @Get('dashboard')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async dashboard(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.getDashboard(tenant, supplier.sub);
    return { success: true, data };
  }

  @Get('profile')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async profile(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.getProfile(tenant, supplier.sub);
    return { success: true, data };
  }

  @Post('profile/update')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async updateProfile(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierProfileUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.updateProfile(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Post('password/update')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async updatePassword(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierUpdatePasswordDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.updatePassword(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Get('pos')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async purchaseOrders(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.portal.listPurchaseOrders(tenant, supplier.sub);
    return { success: true, data };
  }

  @Post('po/confirm')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async confirmPurchaseOrder(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierPurchaseOrderActionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.confirmPurchaseOrder(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Post('po/reject')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async rejectPurchaseOrder(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierPurchaseOrderActionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.rejectPurchaseOrder(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Post('po/update-delivery')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async updateDelivery(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierUpdateDeliveryDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.updateDelivery(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Post('po/ship')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async markShipped(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierPurchaseOrderActionDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.markShipped(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Get('messages')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async messages(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Query('purchaseOrderId') purchaseOrderId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.portal.listMessages(tenant, supplier.sub, purchaseOrderId);
    return { success: true, data };
  }

  @Post('messages/send')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async sendMessage(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierSendMessageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.sendSupplierMessage(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Get('catalog')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async catalog(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.portal.listCatalog(tenant, supplier.sub);
    return { success: true, data };
  }

  @Post('catalog/update')
  @UseGuards(TenantGuard, SupplierAuthGuard)
  async updateCatalog(
    @CurrentTenant() tenant: TenantContext,
    @CurrentSupplier() supplier: SupplierAuthPayload,
    @Body() dto: SupplierCatalogUpdateDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.updateCatalog(tenant, supplier.sub, dto);
    return { success: true, data };
  }

  @Get('admin/overview')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async adminOverview(@CurrentTenant() tenant: TenantContext): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.adminOverview(tenant.tenantId);
    return { success: true, data };
  }

  @Get('admin/:supplierId/messages')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async adminSupplierMessages(
    @CurrentTenant() tenant: TenantContext,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
  ): Promise<ApiSuccessResponse<unknown[]>> {
    const data = await this.portal.listMessages(tenant, supplierId, purchaseOrderId);
    return { success: true, data };
  }

  @Post('admin/:supplierId/messages/send')
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions(AdminPermissionKeys.ACCESS, AdminPermissionKeys.INVENTORY)
  async adminSendSupplierMessage(
    @CurrentTenant() tenant: TenantContext,
    @Param('supplierId', ParseUUIDPipe) supplierId: string,
    @Body() dto: SupplierSendMessageDto,
  ): Promise<ApiSuccessResponse<unknown>> {
    const data = await this.portal.sendMerchantMessage(tenant.tenantId, supplierId, dto);
    return { success: true, data };
  }
}
