import { Injectable, Logger } from '@nestjs/common';
import { OrderInventoryContext } from '../types/order-inventory.context';

export interface InventoryReserveResult {
  reservationIds: string[];
}

export interface InventoryDeductResult {
  movementIds: string[];
}

/** Placeholder for InventoryModule — no stock persistence in Orders domain. */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  /** Soft-reserve stock while order is pending (not a permanent deduction). */
  async reserve(context: OrderInventoryContext): Promise<InventoryReserveResult> {
    this.logger.debug(
      `[placeholder] InventoryService.reserve tenant=${context.tenant.tenantId} order=${context.order.id} lines=${context.items.length} status=${context.toStatus}`,
    );
    return { reservationIds: [] };
  }

  /**
   * Permanent stock deduction when order is confirmed.
   * Replaces an existing soft reservation (CONFIRMED = {@link OrderStatus.ACCEPTED}).
   */
  async deduct(context: OrderInventoryContext): Promise<InventoryDeductResult> {
    this.logger.debug(
      `[placeholder] InventoryService.deduct tenant=${context.tenant.tenantId} order=${context.order.id} from=${context.fromStatus} lines=${context.items.length}`,
    );
    return { movementIds: [] };
  }

  /** Release soft reservation or restore deducted stock on cancel. */
  async releaseOrRestore(context: OrderInventoryContext): Promise<void> {
    this.logger.debug(
      `[placeholder] InventoryService.releaseOrRestore tenant=${context.tenant.tenantId} order=${context.order.id} from=${context.fromStatus} to=${context.toStatus}`,
    );
  }

  /** Placeholder — restore stock after a refund. */
  async restoreForRefund(context: OrderInventoryContext): Promise<void> {
    this.logger.debug(
      `[placeholder] InventoryService.restoreForRefund tenant=${context.tenant.tenantId} order=${context.order.id} from=${context.fromStatus}`,
    );
  }
}
