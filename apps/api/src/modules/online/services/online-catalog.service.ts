import { Injectable } from '@nestjs/common';
import { CatalogBuilderService } from '../../admin/services/catalog-builder.service';

@Injectable()
export class OnlineCatalogService {
  constructor(private readonly catalogBuilder: CatalogBuilderService) {}

  getCatalogBundle(tenantId: string) {
    return Promise.all([
      this.catalogBuilder.listCategories(tenantId),
      this.catalogBuilder.listItems(tenantId, { channel: 'online' }),
    ]).then(([categories, items]) => ({ categories, items }));
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
