import { Injectable } from '@nestjs/common';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { OrdersService } from '../../orders/services/orders.service';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { toOrderResponseDto } from '../../orders/mappers/order.mapper';
import { assertAdminOrderStatusChange } from '../domain/admin-order-safety.util';
import { AdminOrderQueryRepository, AdminOrderListFilter } from '../repositories/admin-order-query.repository';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';
import { AdminNotificationsIntegration } from '../integrations/admin-notifications.integration';

@Injectable()
export class OrdersAdminService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderQueryRepository: AdminOrderQueryRepository,
    private readonly notificationsIntegration: AdminNotificationsIntegration,
  ) {}

  async listOrders(tenant: TenantContext, filter: AdminOrderListFilter) {
    const orders = await this.orderQueryRepository.findForTenant(tenant.tenantId, filter);
    return orders.map((order) => toOrderResponseDto(order, true));
  }

  async getOrderDetails(tenant: TenantContext, orderId: string) {
    return this.ordersService.findOne(tenant, orderId);
  }

  async updateOrderStatus(
    tenant: TenantContext,
    orderId: string,
    dto: AdminUpdateOrderStatusDto,
    user?: AuthenticatedUser,
  ) {
    const current = await this.ordersService.findOne(tenant, orderId);
    assertAdminOrderStatusChange(current.status, dto.status, dto.adminOverride ?? false);

    return this.ordersService.update(tenant, orderId, { status: dto.status }, user);
  }

  resendNotifications(tenantId: string, orderId: string, status?: OrderStatus): void {
    this.notificationsIntegration.resendOrderNotification(
      tenantId,
      orderId,
      status ?? OrderStatus.READY,
    );
  }
}
