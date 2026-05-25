import { Injectable } from '@nestjs/common';
import { CatalogBuilderService } from '../../admin/services/catalog-builder.service';
import { InventoryQueryRepository } from '../../inventory/repositories/inventory-query.repository';

@Injectable()
export class PosCatalogService {
  constructor(
    private readonly catalogBuilder: CatalogBuilderService,
    private readonly inventoryQuery: InventoryQueryRepository,
  ) {}

  async getCatalog(tenantId: string, locationId?: string) {
    const [categories, items] = await Promise.all([
      this.catalogBuilder.listCategories(tenantId),
      this.catalogBuilder.listItems(tenantId, { channel: 'pos' }),
    ]);

    if (!locationId) {
      return { categories, items };
    }

    await this.inventoryQuery.ensureStockForTrackedProducts(tenantId, locationId);

    const stockMap = await this.inventoryQuery.findAvailableStockByProductIds(
      tenantId,
      locationId,
      items.map((item) => item.id),
    );

    const enrichedItems = items.map((item) => {
      if (!item.inventoryTrackingEnabled) {
        return item;
      }

      const locationStock = stockMap.get(item.id);
      const stockLevel =
        locationStock !== undefined ? locationStock : item.stockLevel ?? null;

      const stockStatus =
        stockLevel === null || stockLevel === undefined
          ? 'ok'
          : stockLevel <= 0
            ? 'out'
            : stockLevel <= 5
              ? 'low'
              : 'ok';

      return {
        ...item,
        stockLevel,
        stockStatus,
        isOutOfStock: stockLevel !== null && stockLevel !== undefined && stockLevel <= 0,
      };
    });

    return { categories, items: enrichedItems };
  }
}
