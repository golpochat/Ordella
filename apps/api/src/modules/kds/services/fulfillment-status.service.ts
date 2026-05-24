import { Injectable } from '@nestjs/common';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { FulfillmentDisplayStatus } from '../enums/fulfillment-display-status.enum';
import { FulfillmentSettingsService } from './fulfillment-settings.service';
import { KdsUpdateService } from './kds-update.service';
import { KdsOrderQueryService } from './kds-order-query.service';
import { KdsOrderDetailView } from '../types/kds-order.views';
import { AcknowledgeOrderDto } from '../dto/acknowledge-order.dto';
import { UpdateFulfillmentStatusDto } from '../dto/update-fulfillment-status.dto';

@Injectable()
export class FulfillmentStatusService {
  constructor(
    private readonly kdsUpdateService: KdsUpdateService,
    private readonly orderQueryService: KdsOrderQueryService,
    private readonly fulfillmentSettings: FulfillmentSettingsService,
  ) {}

  async acknowledgeWithLocationSettings(
    tenant: TenantContext,
    dto: AcknowledgeOrderDto,
    user?: AuthenticatedUser,
  ): Promise<KdsOrderDetailView> {
    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, dto.orderId);
    const settings = await this.fulfillmentSettings.getForLocation(
      tenant.tenantId,
      detail.locationId,
    );
    return this.acknowledge(tenant, dto, settings.autoAcceptOrders, user);
  }

  async updateStatus(
    tenant: TenantContext,
    dto: UpdateFulfillmentStatusDto,
    user?: AuthenticatedUser,
  ): Promise<KdsOrderDetailView> {
    switch (dto.status) {
      case FulfillmentDisplayStatus.IN_PROGRESS:
        return this.kdsUpdateService.startFulfillment(tenant, dto.orderId, user);
      case FulfillmentDisplayStatus.READY:
        return this.kdsUpdateService.markOrderReady(tenant, dto.orderId, user, true);
      case FulfillmentDisplayStatus.COMPLETED:
        return this.kdsUpdateService.markOrderCompleted(tenant, dto.orderId, user);
      case FulfillmentDisplayStatus.NEW:
      default:
        return this.orderQueryService.getOrderDetails(tenant.tenantId, dto.orderId);
    }
  }

  async acknowledge(
    tenant: TenantContext,
    dto: AcknowledgeOrderDto,
    autoStartPreparing = false,
    user?: AuthenticatedUser,
  ): Promise<KdsOrderDetailView> {
    const detail = await this.orderQueryService.getOrderDetails(tenant.tenantId, dto.orderId);
    if (autoStartPreparing && detail.status === OrderStatus.ACCEPTED) {
      return this.kdsUpdateService.startFulfillment(tenant, dto.orderId, user);
    }
    return detail;
  }
}
