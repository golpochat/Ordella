import { PurchaseOrderItemEntity } from './purchase-order-item.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { SupplierItemEntity } from './supplier-item.entity';
import { SupplierEntity } from './supplier.entity';

export { PurchaseOrderItemEntity } from './purchase-order-item.entity';
export { PurchaseOrderEntity } from './purchase-order.entity';
export { PurchaseOrderStatus } from './purchase-order-status.enum';
export { SupplierItemEntity } from './supplier-item.entity';
export { SupplierEntity } from './supplier.entity';

export const PROCUREMENT_ENTITIES = [
  SupplierEntity,
  SupplierItemEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
];
