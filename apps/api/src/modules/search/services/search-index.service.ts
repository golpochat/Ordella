import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { ProductEntity, CategoryEntity } from '../../catalog/entities';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { SupplierEntity } from '../../procurement/entities';
import { StockItemEntity } from '../../inventory/entities';
import { LocationEntity } from '../../tenants/entities';
import { WarehouseBinEntity } from '../../warehouse/entities';
import { ReindexSearchDto, SearchAnalyticsEventDto, SearchQueryDto, SemanticSearchQueryDto } from '../dto';
import { SearchAnalyticsEntity, SearchEntityType, SearchIndexEntity } from '../entities';

type UpsertSearchDocument = {
  tenantId: string;
  entityType: SearchEntityType;
  entityId: string;
  title: string;
  body?: string | null;
  keywords?: Array<string | null | undefined>;
  metadata?: Record<string, unknown>;
  sourceUpdatedAt?: Date | null;
};

const VECTOR_SIZE = 32;

@Injectable()
export class SearchIndexService {
  constructor(
    @InjectRepository(SearchIndexEntity)
    private readonly index: Repository<SearchIndexEntity>,
    @InjectRepository(SearchAnalyticsEntity)
    private readonly analyticsEvents: Repository<SearchAnalyticsEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(WarehouseBinEntity)
    private readonly bins: Repository<WarehouseBinEntity>,
  ) {}

  async search(tenant: TenantContext, query: SearchQueryDto) {
    const rows = await this.enrichLocationAvailability(tenant.tenantId, await this.queryIndex(tenant.tenantId, query), query);
    const popularity = await this.productPopularity(tenant.tenantId, rows);
    const q = query.q?.trim().toLowerCase() ?? '';
    const results = rows.map((row) => this.toResult(row, q, query, popularity.get(row.entityId) ?? 0));
    const sorted = this.sortResults(results, query.sort ?? 'relevance').slice(0, query.limit ?? 20);
    if (q) await this.recordAnalyticsEvent(tenant.tenantId, { eventType: 'query', query: q, resultCount: sorted.length });
    return {
      results: sorted,
      total: results.length,
      query: q,
      generatedAt: new Date().toISOString(),
    };
  }

  async autocomplete(tenant: TenantContext, query: SearchQueryDto) {
    const response = await this.search(tenant, { ...query, entityType: query.entityType ?? 'item', limit: query.limit ?? 8 });
    return {
      suggestions: response.results.map((result) => {
        const metadata = result.metadata as Record<string, unknown>;
        return {
          entityType: result.entityType,
          entityId: result.entityId,
          label: result.title,
          subtitle: [metadata.category, metadata.sku].filter(Boolean).join(' - '),
          metadata,
          score: result.relevance,
        };
      }),
      query: response.query,
      generatedAt: response.generatedAt,
    };
  }

  async recordAnalytics(tenant: TenantContext, dto: SearchAnalyticsEventDto) {
    await this.recordAnalyticsEvent(tenant.tenantId, dto);
    return { recorded: true };
  }

  async analytics(tenant: TenantContext) {
    const [events, topQueries] = await Promise.all([
      this.analyticsEvents
        .createQueryBuilder('event')
        .select('event.event_type', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('event.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .groupBy('event.event_type')
        .getRawMany<{ eventType: string; count: string }>(),
      this.analyticsEvents
        .createQueryBuilder('event')
        .select('event.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(event.result_count)', 'avgResults')
        .where('event.tenant_id = :tenantId', { tenantId: tenant.tenantId })
        .andWhere('event.event_type = :eventType', { eventType: 'query' })
        .andWhere('event.query IS NOT NULL')
        .groupBy('event.query')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany<{ query: string; count: string; avgResults: string }>(),
    ]);
    const counts = Object.fromEntries(events.map((row) => [row.eventType, Number(row.count)]));
    const queries = counts.query ?? 0;
    const clicks = counts.click ?? 0;
    const conversions = counts.conversion ?? 0;
    return {
      queries,
      clicks,
      conversions,
      clickThroughRate: queries > 0 ? Number(((clicks / queries) * 100).toFixed(2)) : 0,
      conversionRate: queries > 0 ? Number(((conversions / queries) * 100).toFixed(2)) : 0,
      topQueries: topQueries.map((row) => ({
        query: row.query,
        count: Number(row.count),
        avgResults: Number(Number(row.avgResults ?? 0).toFixed(1)),
      })),
    };
  }

  async semantic(tenant: TenantContext, query: SemanticSearchQueryDto) {
    const rows = await this.queryIndex(tenant.tenantId, query);
    const embedding = this.embed(query.q ?? '');
    const results = rows
      .map((row) => ({
        ...this.toResult(row, query.q?.trim().toLowerCase() ?? ''),
        semanticScore: this.cosine(embedding, row.embedding),
      }))
      .sort((a, b) => b.semanticScore - a.semanticScore);
    return {
      results: results.slice(0, query.limit ?? 20),
      total: results.length,
      query: query.q ?? '',
      generatedAt: new Date().toISOString(),
      engine: 'deterministic-text-embedding',
    };
  }

  async reindex(tenant: TenantContext, dto: ReindexSearchDto = {}) {
    const types = dto.entityType
      ? [dto.entityType]
      : ([
          'item',
          'category',
          'order',
          'customer',
          'supplier',
          'inventory_item',
          'location',
          'bin',
        ] as SearchEntityType[]);

    let indexed = 0;
    for (const type of types) {
      indexed += await this.reindexType(tenant.tenantId, type);
    }
    return { indexed, entityTypes: types, indexedAt: new Date().toISOString() };
  }

  async upsertDocument(document: UpsertSearchDocument) {
    const keywords = this.normalizeKeywords([
      document.title,
      document.body,
      ...(document.keywords ?? []),
      ...Object.values(document.metadata ?? {}).map((value) => String(value ?? '')),
    ]);
    const body = document.body ?? keywords.join(' ');
    const existing = await this.index.findOne({
      where: {
        tenantId: document.tenantId,
        entityType: document.entityType,
        entityId: document.entityId,
      },
    });
    const next =
      existing ??
      this.index.create({
        tenantId: document.tenantId,
        entityType: document.entityType,
        entityId: document.entityId,
      });
    next.title = document.title;
    next.body = body;
    next.keywords = keywords;
    next.metadata = document.metadata ?? {};
    next.embedding = this.embed([document.title, body, keywords.join(' ')].join(' '));
    next.sourceUpdatedAt = document.sourceUpdatedAt ?? null;
    await this.index.save(next);
  }

  async removeDocument(tenantId: string, entityType: SearchEntityType, entityId: string) {
    await this.index.delete({ tenantId, entityType, entityId });
  }

  private async queryIndex(tenantId: string, query: SearchQueryDto) {
    const qb = this.index.createQueryBuilder('search').where('search.tenantId = :tenantId', { tenantId });
    if (query.entityType) {
      qb.andWhere('search.entityType = :entityType', { entityType: query.entityType });
    }
    if (query.q?.trim()) {
      const rawQuery = query.q.trim();
      const q = `%${rawQuery.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((where) => {
          where
            .where(
              `to_tsvector('simple', CONCAT_WS(' ', search.title, COALESCE(search.body, ''), array_to_string(search.keywords, ' ')))
                @@ plainto_tsquery('simple', :fullTextQuery)`,
              { fullTextQuery: rawQuery },
            )
            .orWhere('LOWER(search.title) LIKE :q', { q })
            .orWhere('LOWER(COALESCE(search.body, \'\')) LIKE :q', { q })
            .orWhere(
              `EXISTS (
                SELECT 1 FROM unnest(search.keywords) keyword
                WHERE LOWER(keyword) LIKE :q
              )`,
              { q },
            );
        }),
      );
    }
    this.applyMetadataFilters(qb, query);
    qb.take(Math.min(Math.max(query.limit ?? 20, 50), 100));
    return qb.getMany();
  }

  private applyMetadataFilters(
    qb: ReturnType<Repository<SearchIndexEntity>['createQueryBuilder']>,
    query: SearchQueryDto,
  ) {
    if (query.locationId && query.entityType !== 'item') {
      qb.andWhere("search.metadata->>'locationId' = :locationId", { locationId: query.locationId });
    }
    if (query.categoryId) {
      qb.andWhere("search.metadata->>'categoryId' = :categoryId", { categoryId: query.categoryId });
    }
    if (query.supplierId) {
      qb.andWhere("search.metadata->>'supplierId' = :supplierId", { supplierId: query.supplierId });
    }
    if (query.inStockOnly) {
      qb.andWhere("COALESCE((search.metadata->>'stockLevel')::numeric, 1) > 0");
    }
    if (query.priceMin !== undefined) {
      qb.andWhere("COALESCE((search.metadata->>'price')::numeric, 0) >= :priceMin", {
        priceMin: query.priceMin,
      });
    }
    if (query.priceMax !== undefined) {
      qb.andWhere("COALESCE((search.metadata->>'price')::numeric, 0) <= :priceMax", {
        priceMax: query.priceMax,
      });
    }
    if (query.dateRange) {
      const range = this.parseDateRange(query.dateRange);
      if (range.from) qb.andWhere("COALESCE(search.metadata->>'createdAt', '') >= :from", { from: range.from });
      if (range.to) qb.andWhere("COALESCE(search.metadata->>'createdAt', '') <= :to", { to: range.to });
    }
  }

  private async reindexType(tenantId: string, entityType: SearchEntityType) {
    switch (entityType) {
      case 'item':
        return this.reindexItems(tenantId);
      case 'category':
        return this.reindexCategories(tenantId);
      case 'order':
        return this.reindexOrders(tenantId);
      case 'customer':
        return this.reindexCustomers(tenantId);
      case 'supplier':
        return this.reindexSuppliers(tenantId);
      case 'inventory_item':
        return this.reindexInventoryItems(tenantId);
      case 'location':
        return this.reindexLocations(tenantId);
      case 'bin':
        return this.reindexBins(tenantId);
      default:
        return 0;
    }
  }

  private async reindexItems(tenantId: string) {
    const rows = await this.products.find({ where: { tenantId }, relations: { category: true } });
    await Promise.all(rows.map((item) => this.indexItem(item)));
    return rows.length;
  }

  private async reindexCategories(tenantId: string) {
    const rows = await this.categories.find({ where: { tenantId } });
    await Promise.all(rows.map((category) => this.indexCategory(category)));
    return rows.length;
  }

  private async reindexOrders(tenantId: string) {
    const rows = await this.orders.find({ where: { tenantId }, relations: { items: true } });
    await Promise.all(rows.map((order) => this.indexOrder(order)));
    return rows.length;
  }

  private async reindexCustomers(tenantId: string) {
    const rows = await this.customers.find({ where: { tenantId } });
    await Promise.all(rows.map((customer) => this.indexCustomer(customer)));
    return rows.length;
  }

  private async reindexSuppliers(tenantId: string) {
    const rows = await this.suppliers.find({ where: { tenantId }, relations: { items: { item: true } } });
    await Promise.all(rows.map((supplier) => this.indexSupplier(supplier)));
    return rows.length;
  }

  private async reindexInventoryItems(tenantId: string) {
    const rows = await this.stockItems.find({ where: { tenantId } });
    await Promise.all(rows.map((item) => this.indexInventoryItem(item)));
    return rows.length;
  }

  private async reindexLocations(tenantId: string) {
    const rows = await this.locations.find({ where: { tenantId } });
    await Promise.all(rows.map((location) => this.indexLocation(location)));
    return rows.length;
  }

  private async reindexBins(tenantId: string) {
    const rows = await this.bins.find({
      relations: { zone: { warehouse: true }, contents: { item: true } },
      where: { zone: { warehouse: { tenantId } } },
    });
    await Promise.all(rows.map((bin) => this.indexBin(bin)));
    return rows.length;
  }

  async indexItem(item: ProductEntity) {
    const effectiveName = item.overrideName ?? item.globalItem?.name ?? item.name;
    const effectiveDescription = item.overrideDescription ?? item.globalItem?.description ?? item.description;
    const effectivePrice = item.overridePrice ?? item.globalItem?.basePrice ?? item.price;
    const tags = this.productTags(item);
    await this.upsertDocument({
      tenantId: item.tenantId,
      entityType: 'item',
      entityId: item.id,
      title: effectiveName,
      body: effectiveDescription,
      keywords: [
        effectiveName,
        effectiveDescription,
        item.sku,
        item.barcode,
        item.category?.name,
        item.status,
        ...tags,
        String(effectivePrice),
      ],
      metadata: {
        categoryId: item.categoryId,
        category: item.category?.name,
        tags,
        tenantBoost: Number(item.overrideAttributes?.searchBoost ?? 0),
        globalItemId: item.globalItemId,
        catalogSource: item.globalItemId
          ? item.overrideName || item.overrideDescription || item.overridePrice
            ? 'overridden'
            : 'inherited'
          : 'local',
        sku: item.sku,
        barcode: item.barcode,
        price: effectivePrice,
        stockLevel: item.stockLevel,
        inventoryTrackingEnabled: item.inventoryTrackingEnabled,
        status: item.status,
        entityPath: `/admin/products/${item.id}`,
      },
      sourceUpdatedAt: item.updatedAt,
    });
  }

  async indexCategory(category: CategoryEntity) {
    await this.upsertDocument({
      tenantId: category.tenantId,
      entityType: 'category',
      entityId: category.id,
      title: category.name,
      body: category.description,
      keywords: [category.name, category.description],
      metadata: { isActive: category.isActive, sortOrder: category.sortOrder },
      sourceUpdatedAt: category.updatedAt,
    });
  }

  async indexOrder(order: OrderEntity) {
    await this.upsertDocument({
      tenantId: order.tenantId,
      entityType: 'order',
      entityId: order.id,
      title: order.orderNumber ?? order.id.slice(0, 8),
      body: [order.status, order.orderType, order.paymentStatus, order.total].join(' '),
      keywords: [order.orderNumber, order.status, order.orderType, order.paymentStatus, order.total],
      metadata: {
        locationId: order.locationId,
        customerId: order.customerId,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items?.length ?? 0,
      },
      sourceUpdatedAt: order.updatedAt,
    });
  }

  async indexCustomer(customer: CustomerEntity) {
    await this.upsertDocument({
      tenantId: customer.tenantId,
      entityType: 'customer',
      entityId: customer.id,
      title: customer.name,
      body: [customer.email, customer.phone, customer.tags?.join(' '), customer.segments?.join(' ')].join(' '),
      keywords: [customer.name, customer.email, customer.phone, ...(customer.tags ?? []), ...(customer.segments ?? [])],
      metadata: {
        email: customer.email,
        phone: customer.phone,
        tags: customer.tags,
        segments: customer.segments,
        totalOrders: customer.totalOrders,
        lifetimeValue: customer.lifetimeValue,
        locationId: customer.preferredLocationId,
      },
      sourceUpdatedAt: customer.updatedAt,
    });
  }

  async indexSupplier(supplier: SupplierEntity) {
    await this.upsertDocument({
      tenantId: supplier.tenantId,
      entityType: 'supplier',
      entityId: supplier.id,
      title: supplier.name,
      body: [supplier.contactName, supplier.email, supplier.phone, supplier.address, supplier.notes].join(' '),
      keywords: [
        supplier.name,
        supplier.contactName,
        supplier.email,
        supplier.phone,
        supplier.address,
        ...(supplier.items ?? []).map((item) => item.item?.name ?? item.sku),
      ],
      metadata: {
        supplierId: supplier.id,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        isActive: supplier.isActive,
      },
      sourceUpdatedAt: supplier.createdAt,
    });
  }

  async indexInventoryItem(item: StockItemEntity) {
    await this.upsertDocument({
      tenantId: item.tenantId,
      entityType: 'inventory_item',
      entityId: item.id,
      title: item.name,
      body: [item.sku, item.unit, item.syncSource].join(' '),
      keywords: [item.name, item.sku, item.unit, item.syncSource, item.quantityOnHand],
      metadata: {
        locationId: item.locationId,
        productId: item.productId,
        sku: item.sku,
        stockLevel: item.quantityOnHand,
        quantityReserved: item.quantityReserved,
        reorderLevel: item.reorderLevel,
        syncSource: item.syncSource,
        isActive: item.isActive,
      },
      sourceUpdatedAt: item.updatedAt,
    });
  }

  async indexLocation(location: LocationEntity) {
    await this.upsertDocument({
      tenantId: location.tenantId,
      entityType: 'location',
      entityId: location.id,
      title: location.name,
      body: [location.address, location.timezone, location.status, location.locationType, location.fulfillmentMode].join(' '),
      keywords: [location.name, location.address, location.timezone, location.status, location.locationType, location.fulfillmentMode],
      metadata: {
        locationId: location.id,
        status: location.status,
        locationType: location.locationType,
        fulfillmentMode: location.fulfillmentMode,
        timezone: location.timezone,
      },
      sourceUpdatedAt: location.updatedAt,
    });
  }

  async indexBin(bin: WarehouseBinEntity) {
    const warehouse = bin.zone?.warehouse;
    if (!warehouse?.tenantId) return;
    await this.upsertDocument({
      tenantId: warehouse.tenantId,
      entityType: 'bin',
      entityId: bin.id,
      title: bin.code,
      body: [bin.zone?.name, warehouse.name, ...(bin.contents ?? []).map((item) => item.item?.name)].join(' '),
      keywords: [
        bin.code,
        bin.zone?.name,
        warehouse.name,
        ...(bin.contents ?? []).map((item) => item.item?.name),
      ],
      metadata: {
        binId: bin.id,
        binCode: bin.code,
        zoneId: bin.zoneId,
        zone: bin.zone?.name,
        locationId: warehouse.id,
        capacity: bin.capacity,
        stockLevel: (bin.contents ?? []).reduce((sum, item) => sum + Number(item.quantity), 0),
      },
      sourceUpdatedAt: bin.createdAt,
    });
  }

  private toResult(row: SearchIndexEntity, q: string, query?: SearchQueryDto, popularity = 0) {
    const haystack = [row.title, row.body, row.keywords.join(' ')].join(' ').toLowerCase();
    const exactTitle = q && row.title.toLowerCase() === q ? 5 : 0;
    const titlePrefix = q && row.title.toLowerCase().startsWith(q) ? 3 : 0;
    const textRelevance = q ? exactTitle + titlePrefix + (haystack.includes(q) ? 1 : 0) + this.keywordScore(row.keywords, q) : 0.5;
    const categoryBoost = query?.boostCategoryId && row.metadata.categoryId === query.boostCategoryId ? query.categoryWeight ?? 2 : 0;
    const availabilityBoost = Number(row.metadata.availableQuantity ?? row.metadata.stockLevel ?? 0) > 0
      ? query?.availabilityWeight ?? 1
      : 0;
    const tenantBoost = Number(row.metadata.tenantBoost ?? 0);
    const popularityBoost = Math.log10(popularity + 1) * (query?.popularityWeight ?? 1);
    const relevance = Number((textRelevance + categoryBoost + availabilityBoost + popularityBoost + tenantBoost).toFixed(3));
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      title: row.title,
      body: row.body,
      keywords: row.keywords,
      metadata: { ...row.metadata, popularity },
      relevance,
      updatedAt: row.updatedAt?.toISOString() ?? null,
    };
  }

  private sortResults<T extends { relevance: number; title: string; metadata: Record<string, unknown> }>(
    results: T[],
    sort: 'relevance' | 'price' | 'name' | 'popularity',
  ): T[] {
    return [...results].sort((a, b) => {
      if (sort === 'name') return a.title.localeCompare(b.title);
      if (sort === 'price') return Number(a.metadata.price ?? 0) - Number(b.metadata.price ?? 0);
      if (sort === 'popularity') {
        return Number(b.metadata.popularity ?? b.metadata.totalOrders ?? b.metadata.itemCount ?? 0) - Number(a.metadata.popularity ?? a.metadata.totalOrders ?? a.metadata.itemCount ?? 0);
      }
      return b.relevance - a.relevance;
    });
  }

  private async enrichLocationAvailability(tenantId: string, rows: SearchIndexEntity[], query: SearchQueryDto) {
    const itemRows = rows.filter((row) => row.entityType === 'item');
    if (!query.locationId || !itemRows.length) return rows;
    const stock = await this.stockItems.find({
      where: {
        tenantId,
        locationId: query.locationId,
        productId: In(itemRows.map((row) => row.entityId)),
      },
    });
    const stockByProduct = new Map(stock.map((item) => [item.productId, Number(item.quantityOnHand)]));
    const enriched = rows.map((row) => {
      if (row.entityType !== 'item') return row;
      const availableQuantity = stockByProduct.get(row.entityId) ?? Number(row.metadata.stockLevel ?? 0);
      row.metadata = { ...row.metadata, locationId: query.locationId, availableQuantity };
      return row;
    });
    return query.inStockOnly
      ? enriched.filter((row) => row.entityType !== 'item' || Number(row.metadata.availableQuantity ?? row.metadata.stockLevel ?? 0) > 0)
      : enriched;
  }

  private async productPopularity(tenantId: string, rows: SearchIndexEntity[]) {
    const productIds = rows.filter((row) => row.entityType === 'item').map((row) => row.entityId);
    if (!productIds.length) return new Map<string, number>();
    const raw = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
      .select('item.product_id', 'productId')
      .addSelect('SUM(item.quantity)', 'quantity')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('item.product_id IN (:...productIds)', { productIds })
      .groupBy('item.product_id')
      .getRawMany<{ productId: string; quantity: string }>();
    return new Map(raw.map((row) => [row.productId, Number(row.quantity)]));
  }

  private async recordAnalyticsEvent(tenantId: string, dto: SearchAnalyticsEventDto) {
    await this.analyticsEvents.save(this.analyticsEvents.create({
      tenantId,
      eventType: dto.eventType,
      query: dto.query?.trim().slice(0, 255) || null,
      entityType: dto.entityType ?? null,
      entityId: dto.entityId ?? null,
      resultCount: dto.resultCount ?? 0,
      metadata: {},
    }));
  }

  private productTags(item: ProductEntity) {
    const raw = item.overrideAttributes?.tags ?? item.overrideAttributes?.keywords;
    if (Array.isArray(raw)) return raw.map((tag) => String(tag)).filter(Boolean);
    if (typeof raw === 'string') return raw.split(',').map((tag) => tag.trim()).filter(Boolean);
    return [];
  }

  private normalizeKeywords(values: Array<string | null | undefined>): string[] {
    const words = values
      .flatMap((value) => String(value ?? '').toLowerCase().split(/[^a-z0-9]+/))
      .map((word) => word.trim())
      .filter((word) => word.length > 1);
    return [...new Set(words)].slice(0, 200);
  }

  private keywordScore(keywords: string[], q: string) {
    return keywords.reduce((score, keyword) => score + (keyword.includes(q) ? 0.2 : 0), 0);
  }

  private embed(text: string): number[] {
    const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
    const tokens = this.normalizeKeywords([text]);
    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i += 1) {
        hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
      }
      vector[hash % VECTOR_SIZE] += 1;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => Number((value / norm).toFixed(6)));
  }

  private cosine(a: number[], b: number[]) {
    if (!a.length || !b.length) return 0;
    return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
  }

  private parseDateRange(value: string) {
    if (value === 'last_week') {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 7);
      return { from: from.toISOString(), to: to.toISOString() };
    }
    const [from, to] = value.split('..');
    return { from, to };
  }
}
