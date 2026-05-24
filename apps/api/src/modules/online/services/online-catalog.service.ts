import { Injectable } from '@nestjs/common';
import { CatalogBuilderService } from '../../admin/services/catalog-builder.service';
import { MenuQueryService } from './menu-query.service';

@Injectable()
export class OnlineCatalogService {
  constructor(
    private readonly catalogBuilder: CatalogBuilderService,
    private readonly menuQuery: MenuQueryService,
  ) {}

  async getCatalogBundle(tenantId: string, locationId?: string) {
    if (locationId) {
      const menu = await this.menuQuery.getPublicMenu(tenantId, locationId);
      return {
        categories: menu.categories,
        items: menu.products,
        locationId,
      };
    }

    const [categories, items] = await Promise.all([
      this.catalogBuilder.listCategories(tenantId),
      this.catalogBuilder.listItems(tenantId, { channel: 'online' }),
    ]);
    return { categories, items };
  }

  listCategories(tenantId: string) {
    return this.catalogBuilder.listCategories(tenantId);
  }

  listItems(tenantId: string, categoryId?: string) {
    return this.catalogBuilder.listItems(tenantId, {
      channel: 'online',
      categoryId,
    });
  }
}
