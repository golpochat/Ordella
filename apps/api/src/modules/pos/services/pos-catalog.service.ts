import { Injectable } from '@nestjs/common';
import { CatalogBuilderService } from '../../admin/services/catalog-builder.service';
import { InventoryQueryRepository } from '../../inventory/repositories/inventory-query.repository';
import { BundlesService } from '../../bundles';

@Injectable()
export class PosCatalogService {
  constructor(
    private readonly catalogBuilder: CatalogBuilderService,
    private readonly inventoryQuery: InventoryQueryRepository,
    private readonly bundles: BundlesService,
  ) {}

  async getCatalog(tenantId: string, locationId?: string) {
    const [categories, items, bundles] = await Promise.all([
      this.catalogBuilder.listCategories(tenantId),
      this.catalogBuilder.listItems(tenantId, { channel: 'pos' }),
      this.bundles.list({ tenantId, source: 'header' }, locationId),
    ]);
    const enrichedBundles = bundles.filter((bundle) => bundle.isActive).map((bundle) => {
      const rawTotal = bundle.items.reduce((sum, bundleItem) => {
        const product = items.find((item) => item.id === bundleItem.itemId);
        return sum + (Number(product?.price ?? 0) * bundleItem.quantity);
      }, 0);
      const discount = bundle.discountAmount
        ? Number(bundle.discountAmount)
        : bundle.discountPercent
          ? rawTotal * (Number(bundle.discountPercent) / 100)
          : 0;
      const price = bundle.priceType === 'fixed'
        ? Number(bundle.fixedPrice ?? 0)
        : Math.max(0, rawTotal - discount);
      return {
        id: bundle.id,
        itemType: 'bundle',
        bundleId: bundle.id,
        name: bundle.name,
        description: bundle.description,
        categoryId: null,
        price: price.toFixed(2),
        sku: null,
        barcode: null,
        isActive: bundle.isActive,
        inventoryTrackingEnabled: false,
        stockLevel: null,
        stockStatus: 'ok',
        isOutOfStock: false,
        variants: [],
        modifiers: [],
        bundleItems: bundle.items.map((bundleItem) => ({
          itemId: bundleItem.itemId,
          name: items.find((item) => item.id === bundleItem.itemId)?.name,
          quantity: bundleItem.quantity,
          isOptional: bundleItem.isOptional,
        })),
      };
    });

    if (!locationId) {
      return { categories, items: [...items, ...enrichedBundles] };
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

    return { categories, items: [...enrichedItems, ...enrichedBundles] };
  }
}
