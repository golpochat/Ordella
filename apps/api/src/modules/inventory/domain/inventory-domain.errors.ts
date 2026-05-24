import { BadRequestException, NotFoundException } from '@nestjs/common';

export function throwInventoryItemNotFound(productId: string, locationId: string): never {
  throw new NotFoundException(
    `Inventory item not found for product ${productId} at location ${locationId}`,
  );
}

export function throwInsufficientStock(sku: string, available: number, requested: number): never {
  throw new BadRequestException(
    `Insufficient stock for SKU "${sku}": available ${available}, requested ${requested}`,
  );
}

export function throwOverReservation(sku: string, available: number, requested: number): never {
  throw new BadRequestException(
    `Cannot reserve ${requested} for SKU "${sku}": only ${available} available`,
  );
}

export function throwOverDeduction(sku: string, onHand: number, requested: number): never {
  throw new BadRequestException(
    `Cannot deduct ${requested} from SKU "${sku}": only ${onHand} on hand`,
  );
}

export function throwInsufficientReserved(
  sku: string,
  reserved: number,
  requested: number,
): never {
  throw new BadRequestException(
    `Cannot deduct ${requested} from SKU "${sku}": only ${reserved} reserved`,
  );
}

export function throwNegativeStock(sku: string, field: string): never {
  throw new BadRequestException(`Stock operation would make ${field} negative for SKU "${sku}"`);
}

export function throwInvalidAdjustmentDelta(delta: number): never {
  throw new BadRequestException(`Invalid adjustment delta: ${delta}`);
}
