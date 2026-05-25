import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductEntity } from '../../catalog/entities';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { CustomerInsightEntity } from '../../crm/entities';
import { InventoryQueryRepository } from '../../inventory/repositories/inventory-query.repository';
import { CustomerEntity } from '../../loyalty/entities';
import { isOnlineChannelVisible, isPosChannelVisible } from '../../online/domain/online-pricing.util';
import { OrderItemEntity, OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { RecommendationEventDto, RecommendationSettingsDto } from '../dto';
import {
  RecommendationCacheEntity,
  RecommendationEventEntity,
  RecommendationSettingsEntity,
} from '../entities';
import {
  RecommendationChannel,
  RecommendationItem,
  RecommendationReason,
  RecommendationResponse,
} from '../types';

type ScoreEntry = { score: number; reason: RecommendationReason };

type RecommendationInput = {
  tenantId: string;
  itemIds?: string[];
  customerId?: string;
  locationId?: string;
  limit?: number;
  channel: RecommendationChannel;
  source?: 'item' | 'customer' | 'cart';
};

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(RecommendationEventEntity)
    private readonly events: Repository<RecommendationEventEntity>,
    @InjectRepository(RecommendationCacheEntity)
    private readonly cache: Repository<RecommendationCacheEntity>,
    @InjectRepository(RecommendationSettingsEntity)
    private readonly settings: Repository<RecommendationSettingsEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(CustomerInsightEntity)
    private readonly insights: Repository<CustomerInsightEntity>,
    private readonly inventory: InventoryQueryRepository,
  ) {}

  async forItem(tenantId: string, itemId: string, input: Omit<RecommendationInput, 'tenantId' | 'itemIds' | 'source'>) {
    return this.recommend({ ...input, tenantId, itemIds: [itemId], source: 'item' });
  }

  async forCustomer(tenantId: string, customerId: string, input: Omit<RecommendationInput, 'tenantId' | 'customerId' | 'source'>) {
    return this.recommend({ ...input, tenantId, customerId, source: 'customer' });
  }

  async forCart(tenantId: string, input: Omit<RecommendationInput, 'tenantId' | 'source'>) {
    return this.recommend({ ...input, tenantId, source: 'cart' });
  }

  async recordEvent(tenantId: string, dto: RecommendationEventDto) {
    await this.events.save(this.events.create({
      tenantId,
      customerId: dto.customerId ?? null,
      itemId: dto.itemId,
      eventType: dto.eventType,
      source: dto.source ?? null,
    }));
    return { recorded: true };
  }

  async getSettings(tenantId: string) {
    return this.ensureSettings(tenantId);
  }

  async updateSettings(tenantId: string, dto: RecommendationSettingsDto) {
    const current = await this.ensureSettings(tenantId);
    return this.settings.save({
      ...current,
      isEnabled: dto.isEnabled ?? current.isEnabled,
      personalizationEnabled: dto.personalizationEnabled ?? current.personalizationEnabled,
      cartUpsellsEnabled: dto.cartUpsellsEnabled ?? current.cartUpsellsEnabled,
      maxRecommendations: dto.maxRecommendations ?? current.maxRecommendations,
    });
  }

  async analytics(tenantId: string) {
    const [events, topItems, settings] = await Promise.all([
      this.events
        .createQueryBuilder('event')
        .select('event.event_type', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('event.tenant_id = :tenantId', { tenantId })
        .groupBy('event.event_type')
        .getRawMany<{ eventType: string; count: string }>(),
      this.events
        .createQueryBuilder('event')
        .innerJoin(ProductEntity, 'product', 'product.id = event.item_id')
        .select('event.item_id', 'itemId')
        .addSelect('product.name', 'name')
        .addSelect('COUNT(*)', 'events')
        .where('event.tenant_id = :tenantId', { tenantId })
        .groupBy('event.item_id')
        .addGroupBy('product.name')
        .orderBy('events', 'DESC')
        .limit(10)
        .getRawMany<{ itemId: string; name: string; events: string }>(),
      this.ensureSettings(tenantId),
    ]);

    const counts = Object.fromEntries(events.map((row) => [row.eventType, Number(row.count)]));
    const impressions = counts.impression ?? counts.view ?? 0;
    const clicks = counts.click ?? 0;
    const addToCart = counts.add_to_cart ?? 0;
    const purchases = counts.purchase ?? 0;
    return {
      settings,
      impressions,
      clicks,
      addToCart,
      purchases,
      addToCartRate: impressions > 0 ? Number(((addToCart / impressions) * 100).toFixed(2)) : 0,
      conversionRate: impressions > 0 ? Number(((purchases / impressions) * 100).toFixed(2)) : 0,
      revenueInfluenced: '0.00',
      aovUplift: '0.00',
      conversionUplift: '0.00',
      topRecommendedItems: topItems.map((row) => ({
        itemId: row.itemId,
        name: row.name,
        events: Number(row.events),
      })),
    };
  }

  private async recommend(input: RecommendationInput): Promise<RecommendationResponse> {
    const settings = await this.ensureSettings(input.tenantId);
    const limit = Math.min(input.limit ?? settings.maxRecommendations, settings.maxRecommendations, 12);
    if (!settings.isEnabled || (input.source === 'cart' && !settings.cartUpsellsEnabled)) {
      return { recommendations: [], strategy: ['disabled'], generatedAt: new Date().toISOString() };
    }

    const seedIds = [...new Set((input.itemIds ?? []).filter(Boolean))];
    const scores = new Map<string, ScoreEntry>();
    const strategy: string[] = [];

    if (seedIds.length) {
      await this.addCoPurchaseScores(input.tenantId, seedIds, scores);
      await this.addCoViewScores(input.tenantId, seedIds, scores);
      await this.addCategoryScores(input.tenantId, seedIds, scores);
      strategy.push('co_purchase', 'co_view', 'category_similarity');
    }

    if (input.customerId && settings.personalizationEnabled) {
      await this.addCustomerScores(input.tenantId, input.customerId, scores, seedIds);
      strategy.push('crm_personalization');
    }

    await this.addPopularScores(input.tenantId, input.locationId, scores);
    strategy.push('popular_fallback');

    const ranked = [...scores.entries()]
      .filter(([id]) => !seedIds.includes(id))
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, Math.max(limit * 4, 20));

    const products = await this.resolveAvailableProducts(
      input.tenantId,
      ranked.map(([id]) => id),
      input.channel,
      input.locationId,
    );
    const productById = new Map(products.map((product) => [product.id, product]));
    const recommendations: RecommendationItem[] = [];
    for (const [id, entry] of ranked) {
      const product = productById.get(id);
      if (!product) continue;
      recommendations.push({ item: product, score: Number(entry.score.toFixed(2)), reason: entry.reason });
      if (recommendations.length >= limit) break;
    }

    if (input.source === 'item' && seedIds[0]) {
      await this.cache.save({
        tenantId: input.tenantId,
        itemId: seedIds[0],
        recommendations: recommendations.map((item) => item.item.id),
      });
    }

    return { recommendations, strategy, generatedAt: new Date().toISOString() };
  }

  private async addCoPurchaseScores(tenantId: string, seedIds: string[], scores: Map<string, ScoreEntry>) {
    const rows = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
      .innerJoin(OrderItemEntity, 'seed', 'seed.order_id = item.order_id AND seed.product_id IN (:...seedIds)', { seedIds })
      .select('item.product_id', 'productId')
      .addSelect('SUM(item.quantity)', 'weight')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: [OrderStatus.CANCELLED, OrderStatus.FAILED] })
      .andWhere('item.product_id NOT IN (:...seedIds)', { seedIds })
      .groupBy('item.product_id')
      .orderBy('weight', 'DESC')
      .limit(40)
      .getRawMany<{ productId: string; weight: string }>();

    for (const row of rows) this.bump(scores, row.productId, Number(row.weight) * 5, 'frequently_bought_together');
  }

  private async addCoViewScores(tenantId: string, seedIds: string[], scores: Map<string, ScoreEntry>) {
    const rows = await this.events
      .createQueryBuilder('event')
      .innerJoin(
        RecommendationEventEntity,
        'seed',
        'seed.customer_id = event.customer_id AND seed.item_id IN (:...seedIds)',
        { seedIds },
      )
      .select('event.item_id', 'itemId')
      .addSelect('COUNT(*)', 'weight')
      .where('event.tenant_id = :tenantId', { tenantId })
      .andWhere('event.customer_id IS NOT NULL')
      .andWhere('event.event_type IN (:...types)', { types: ['view', 'impression', 'click'] })
      .andWhere('event.item_id NOT IN (:...seedIds)', { seedIds })
      .groupBy('event.item_id')
      .orderBy('weight', 'DESC')
      .limit(40)
      .getRawMany<{ itemId: string; weight: string }>();

    for (const row of rows) this.bump(scores, row.itemId, Number(row.weight) * 3, 'frequently_viewed_together');
  }

  private async addCategoryScores(tenantId: string, seedIds: string[], scores: Map<string, ScoreEntry>) {
    const seeds = await this.products.find({ where: { tenantId, id: In(seedIds) } });
    const categoryIds = [...new Set(seeds.map((product) => product.categoryId).filter(Boolean) as string[])];
    if (!categoryIds.length) return;
    const products = await this.products.find({
      where: { tenantId, categoryId: In(categoryIds), status: ProductStatus.ACTIVE },
      take: 50,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    for (const product of products) this.bump(scores, product.id, 2, 'same_category');
  }

  private async addCustomerScores(tenantId: string, customerId: string, scores: Map<string, ScoreEntry>, seedIds: string[]) {
    const [customer, insight, previousProducts] = await Promise.all([
      this.customers.findOne({ where: { tenantId, id: customerId } }),
      this.insights.findOne({ where: { tenantId, customerId } }),
      this.orderItems
        .createQueryBuilder('item')
        .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
        .where('order.tenant_id = :tenantId', { tenantId })
        .andWhere('order.customer_id = :customerId', { customerId })
        .select('item.product_id', 'productId')
        .addSelect('SUM(item.quantity)', 'quantity')
        .groupBy('item.product_id')
        .orderBy('quantity', 'DESC')
        .limit(20)
        .getRawMany<{ productId: string; quantity: string }>(),
    ]);
    if (!customer && !insight && !previousProducts.length) return;

    for (const row of previousProducts) {
      if (!seedIds.includes(row.productId)) this.bump(scores, row.productId, Number(row.quantity) * 2, 'customer_preference');
    }

    const categoryIds = insight?.categoriesPurchased ?? [];
    if (!categoryIds.length) return;
    const products = await this.products.find({
      where: { tenantId, categoryId: In(categoryIds), status: ProductStatus.ACTIVE },
      take: 60,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    for (const product of products) this.bump(scores, product.id, 4, 'customer_preference');
  }

  private async addPopularScores(tenantId: string, locationId: string | undefined, scores: Map<string, ScoreEntry>) {
    const rows = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
      .select('item.product_id', 'productId')
      .addSelect('SUM(item.quantity)', 'weight')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: [OrderStatus.CANCELLED, OrderStatus.FAILED] })
      .groupBy('item.product_id')
      .orderBy('weight', 'DESC')
      .limit(50);
    if (locationId) rows.andWhere('order.location_id = :locationId', { locationId });
    const popular = await rows.getRawMany<{ productId: string; weight: string }>();
    for (const row of popular) this.bump(scores, row.productId, Number(row.weight), 'popular_item');
  }

  private async resolveAvailableProducts(
    tenantId: string,
    productIds: string[],
    channel: RecommendationChannel,
    locationId?: string,
  ) {
    if (!productIds.length) return [];
    const products = await this.products.find({
      where: { tenantId, id: In(productIds), status: ProductStatus.ACTIVE },
    });
    const visible = products.filter((product) =>
      channel === 'pos'
        ? isPosChannelVisible(product.channelVisibility)
        : isOnlineChannelVisible(product.channelVisibility),
    );
    const trackedIds = visible.filter((product) => product.inventoryTrackingEnabled).map((product) => product.id);
    const availableById =
      locationId && trackedIds.length
        ? await this.inventory.findAvailableStockByProductIds(tenantId, locationId, trackedIds)
        : new Map<string, number>();

    return visible
      .map((product) => {
        const availableQuantity = product.inventoryTrackingEnabled
          ? locationId
            ? availableById.get(product.id) ?? 0
            : product.stockLevel
          : product.stockLevel;
        const isOutOfStock = product.inventoryTrackingEnabled
          ? (availableQuantity ?? 0) <= 0
          : product.stockLevel !== null && product.stockLevel <= 0;
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          sku: product.sku,
          barcode: product.barcode,
          imageUrl: product.imageUrl,
          isActive: product.status === ProductStatus.ACTIVE,
          inventoryTrackingEnabled: product.inventoryTrackingEnabled,
          stockLevel: product.stockLevel,
          availableQuantity,
          isOutOfStock,
          variants: [],
          modifiers: [],
        };
      })
      .filter((product) => !product.isOutOfStock);
  }

  private bump(scores: Map<string, ScoreEntry>, productId: string, amount: number, reason: RecommendationReason) {
    const current = scores.get(productId);
    if (!current) {
      scores.set(productId, { score: amount, reason });
      return;
    }
    scores.set(productId, {
      score: current.score + amount,
      reason: current.score >= amount ? current.reason : reason,
    });
  }

  private async ensureSettings(tenantId: string) {
    const existing = await this.settings.findOne({ where: { tenantId } });
    if (existing) return existing;
    return this.settings.save(this.settings.create({ tenantId }));
  }
}
