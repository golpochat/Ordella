import { Injectable } from '@nestjs/common';
import {
  InventoryDeductResult,
  InventoryReserveResult,
  InventoryService,
} from '../integrations/inventory.service';
import { OrderInventoryContext } from '../types/order-inventory.context';

/**
 * Orders-domain inventory facade — lifecycle must not import integrations directly.
 */
@Injectable()
export class OrderInventoryService {
  constructor(private readonly inventoryService: InventoryService) {}

  reserve(context: OrderInventoryContext): Promise<InventoryReserveResult> {
    return this.inventoryService.reserve(context);
  }

  deduct(context: OrderInventoryContext): Promise<InventoryDeductResult> {
    return this.inventoryService.deduct(context);
  }

  releaseOrRestore(context: OrderInventoryContext): Promise<void> {
    return this.inventoryService.releaseOrRestore(context);
  }

  restoreForRefund(context: OrderInventoryContext): Promise<void> {
    return this.inventoryService.restoreForRefund(context);
  }
}
