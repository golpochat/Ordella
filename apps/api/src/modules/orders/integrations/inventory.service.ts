import { Injectable } from '@nestjs/common';
import { InventoryService as CoreInventoryService } from '../../inventory/services/inventory.service';
import { InventoryOrderContext } from '../../inventory/types/inventory-order.context';
import { OrderInventoryContext } from '../types/order-inventory.context';

export interface InventoryReserveResult {
  reservationIds: string[];
}

export interface InventoryDeductResult {
  movementIds: string[];
}

/** Bridges order lifecycle to core per-location stock_items inventory. */
@Injectable()
export class InventoryService {
  constructor(private readonly core: CoreInventoryService) {}

  reserve(context: OrderInventoryContext): Promise<InventoryReserveResult> {
    return this.core.reserve(this.toCoreContext(context));
  }

  deduct(context: OrderInventoryContext): Promise<InventoryDeductResult> {
    return this.core.deduct(this.toCoreContext(context));
  }

  releaseOrRestore(context: OrderInventoryContext): Promise<void> {
    return this.core.releaseOrRestore(this.toCoreContext(context));
  }

  restoreForRefund(context: OrderInventoryContext): Promise<void> {
    return this.core.restoreForRefund(this.toCoreContext(context));
  }

  private toCoreContext(context: OrderInventoryContext): InventoryOrderContext {
    return {
      tenantId: context.tenant.tenantId,
      orderId: context.order.id,
      locationId: context.order.locationId,
      lines: context.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
  }
}
