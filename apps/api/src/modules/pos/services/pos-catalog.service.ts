import { Injectable } from '@nestjs/common';
import { CatalogBuilderService } from '../../admin/services/catalog-builder.service';

@Injectable()
export class PosCatalogService {
  constructor(private readonly catalogBuilder: CatalogBuilderService) {}

  getCatalog(tenantId: string) {
    return Promise.all([
      this.catalogBuilder.listCategories(tenantId),
      this.catalogBuilder.listItems(tenantId, { channel: 'pos' }),
    ]).then(([categories, items]) => ({ categories, items }));
  }
}
