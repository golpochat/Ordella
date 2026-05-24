import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { OrdersService } from '../../orders/services/orders.service';
import { OrderLifecycleService } from '../../orders/services/order-lifecycle.service';
import { OrderAccessService } from '../../orders/services/order-access.service';
import { OrderRepository } from '../../orders/repositories/order.repository';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import {
  assertOrderStatusTransition,
  canTransitionOrderStatus,
} from '../../orders/domain/order-lifecycle.transitions';
import { KdsOrderItemStateRepository } from '../repositories/kds-order-item-state.repository';
import { KdsOrderQueryService } from './kds-order-query.service';
import { KdsBroadcastService } from './kds-broadcast.service';
import { KdsNotificationsIntegration } from '../integrations/kds-notifications.integration';
import { KdsReportingIntegration } from '../integrations/kds-reporting.integration';
import { KdsLineStatus } from '../enums/kds-line-status.enum';
import {
  throwKdsInvalidLineTransition,
  throwKdsInvalidOrderTransition,
  throwKdsItemsNotAllCompleted,
  throwKdsLineItemNotFound,
  throwKdsOrderNotPreparing,
} from '../domain/kds-domain.errors';
import { KdsOrderDetailView } from '../types/kds-order.views';
import { KdsItemActionDto } from '../dto/kds-item-action.dto';

@Injectable()
export class KdsUpdateService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
    private readonly orderLifecycleService: OrderLifecycleService,
    private readonly orderAccessService: OrderAccessService,
    private readonly orderRepository: OrderRepository,
    private readonly itemStateRepository: KdsOrderItemStateRepository,
    private readonly orderQueryService: KdsOrderQueryService,
    private readonly broadcastService: KdsBroadcastService,
    private readonly notificationsIntegration: KdsNotificationsIntegration,
    private readonly reportingIntegration: KdsReportingIntegration,
  ) {}

  async markOrderPreparing(
    tenant: TenantContext,
    orderId: string,
    user?: AuthenticatedUser,
  ): Promise<KdsOrderDetailView> {
    const current = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    if (!canTransitionOrderStatus(current.status, OrderStatus.PREPARING)) {
      throwKdsInvalidOrderTransition(current.status, OrderStatus.PREPARING);
    }

    if (current.status !== OrderStatus.PREPARING) {
      await this.transitionOrder(tenant, orderId, OrderStatus.PREPARING, user);
    }

    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    this.broadcastService.orderPreparing(tenant.tenantId, detail);
    this.broadcastService.orderUpdated(tenant.tenantId, detail);
    this.notificationsIntegration.notifyOrderStatus(tenant.tenantId, orderId, OrderStatus.PREPARING);
    await this.reportingIntegration.emitOrderMilestone(tenant.tenantId, orderId, OrderStatus.PREPARING);

    return detail;
  }

  async markOrderReady(
    tenant: TenantContext,
    orderId: string,
    user?: AuthenticatedUser,
  ): Promise<KdsOrderDetailView> {
    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);

    if (detail.status !== OrderStatus.PREPARING && detail.status !== OrderStatus.READY) {
      throwKdsOrderNotPreparing(detail.status);
    }

    const allCompleted = detail.lineItems.every(
      (line) => line.kdsStatus === KdsLineStatus.COMPLETED,
    );
    if (!allCompleted) {
      throwKdsItemsNotAllCompleted();
    }

    if (!canTransitionOrderStatus(detail.status, OrderStatus.READY)) {
      throwKdsInvalidOrderTransition(detail.status, OrderStatus.READY);
    }

    if (detail.status !== OrderStatus.READY) {
      await this.transitionOrder(tenant, orderId, OrderStatus.READY, user);
    }

    const refreshed = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    this.broadcastService.orderReady(tenant.tenantId, refreshed);
    this.broadcastService.orderUpdated(tenant.tenantId, refreshed);
    this.notificationsIntegration.notifyOrderStatus(tenant.tenantId, orderId, OrderStatus.READY);
    await this.reportingIntegration.emitOrderMilestone(tenant.tenantId, orderId, OrderStatus.READY);

    return refreshed;
  }

  async markItemStarted(
    tenant: TenantContext,
    orderId: string,
    lineItemId: string,
    dto?: KdsItemActionDto,
  ): Promise<KdsOrderDetailView> {
    await this.updateLineStatus(
      tenant.tenantId,
      orderId,
      lineItemId,
      KdsLineStatus.STARTED,
      dto?.station,
    );
    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    this.broadcastService.orderUpdated(tenant.tenantId, detail, dto?.station);
    return detail;
  }

  async markItemCompleted(
    tenant: TenantContext,
    orderId: string,
    lineItemId: string,
    dto?: KdsItemActionDto,
  ): Promise<KdsOrderDetailView> {
    await this.updateLineStatus(
      tenant.tenantId,
      orderId,
      lineItemId,
      KdsLineStatus.COMPLETED,
      dto?.station,
    );
    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, orderId);
    this.broadcastService.orderUpdated(tenant.tenantId, detail, dto?.station);
    return detail;
  }

  private async transitionOrder(
    tenant: TenantContext,
    orderId: string,
    toStatus: OrderStatus,
    user?: AuthenticatedUser,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.orderAccessService.requireOrderWithItems(
        tenant.tenantId,
        orderId,
        manager,
      );
      const fromStatus = order.status;
      assertOrderStatusTransition(fromStatus, toStatus);

      await this.orderLifecycleService.transition(
        tenant,
        order,
        order.items ?? [],
        toStatus,
        { changedBy: user?.id ?? null, manager },
      );

      await this.orderRepository.save(order, manager);
    });

    await this.ordersService.findOne(tenant, orderId);
  }

  private async updateLineStatus(
    tenantId: string,
    orderId: string,
    lineItemId: string,
    target: KdsLineStatus,
    station?: string,
  ): Promise<void> {
    const order = await this.orderAccessService.requireOrderWithItems(tenantId, orderId);
    const item = (order.items ?? []).find((row) => row.id === lineItemId);
    if (!item) {
      throwKdsLineItemNotFound(orderId, lineItemId);
    }

    await this.itemStateRepository.ensurePendingForItems(
      tenantId,
      orderId,
      (order.items ?? []).map((row) => row.id),
    );

    const state = await this.itemStateRepository.findByOrderItemForTenant(tenantId, lineItemId);
    if (!state) {
      throwKdsLineItemNotFound(orderId, lineItemId);
    }

    if (target === KdsLineStatus.STARTED) {
      if (state.status !== KdsLineStatus.PENDING) {
        throwKdsInvalidLineTransition(state.status, target);
      }
      state.status = KdsLineStatus.STARTED;
      state.startedAt = new Date();
      if (station) {
        state.station = station;
      }
    } else if (target === KdsLineStatus.COMPLETED) {
      if (state.status !== KdsLineStatus.STARTED) {
        throwKdsInvalidLineTransition(state.status, target);
      }
      state.status = KdsLineStatus.COMPLETED;
      state.completedAt = new Date();
    }

    await this.itemStateRepository.save(state);
  }
}
