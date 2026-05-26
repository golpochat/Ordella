import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { availableQty, formatQty, parseQty } from '../../inventory/domain/stock-quantity.util';
import { StockItemEntity, StockTransferEntity } from '../../inventory/entities';
import { StockTransferStatus } from '../../inventory/enums/stock-transfer-status.enum';
import { StockTransfersService } from '../../inventory/services';
import { ProductEntity } from '../../catalog/entities';
import { ForecastService } from '../../forecast';
import { PurchaseOrderEntity, PurchaseOrderStatus, SupplierEntity, SupplierItemEntity } from '../../procurement/entities';
import { PurchaseOrdersService } from '../../procurement/services';
import { LocationEntity, LocationType } from '../../tenants/entities';
import { WarehouseService } from '../../warehouse/services';
import { NotificationsService } from '../../notifications/services';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import {
  ApproveSuggestedPurchaseOrderDto,
  GeneratePurchaseOrderSuggestionsDto,
  ReplenishmentActionQueryDto,
  ReplenishmentDashboardQueryDto,
  RunReplenishmentDto,
  UpsertReplenishmentRuleDto,
} from '../dto';
import {
  ReplenishmentActionEntity,
  ReplenishmentActionType,
  ReplenishmentRuleEntity,
} from '../entities';

type Candidate = {
  rule: ReplenishmentRuleEntity;
  stockItem: StockItemEntity | null;
  product: ProductEntity;
  available: number;
  projectedDemand: number;
  requiredQuantity: number;
  reason: string;
};

type ReplenishmentDashboardRow = {
  productId: string;
  name: string;
  locationId: string;
  available: number;
  forecastedDemand: number;
  daysUntilStockout: number | null;
  forecastedDepletionDate: string | null;
  recommendedReorderDate: string | null;
  recommendedReorderQty: number;
  riskScore: number;
  alertType: 'stockout_risk' | 'overstocked' | 'low_stock' | 'healthy';
  supplierId: string | null;
  supplierName: string | null;
  leadTimeDays: number;
  minOrderQty: number;
  caseSize: number;
  estimatedCost: string;
};

@Injectable()
export class ReplenishmentService {
  constructor(
    @InjectRepository(ReplenishmentRuleEntity)
    private readonly rules: Repository<ReplenishmentRuleEntity>,
    @InjectRepository(ReplenishmentActionEntity)
    private readonly actions: Repository<ReplenishmentActionEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(SupplierEntity)
    private readonly suppliers: Repository<SupplierEntity>,
    @InjectRepository(SupplierItemEntity)
    private readonly supplierItems: Repository<SupplierItemEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly purchaseOrderRepository: Repository<PurchaseOrderEntity>,
    private readonly purchaseOrders: PurchaseOrdersService,
    private readonly stockTransfers: StockTransfersService,
    private readonly warehouse: WarehouseService,
    private readonly forecasts: ForecastService,
    private readonly notifications: NotificationsService,
  ) {}

  listRules(tenant: TenantContext) {
    return this.rules.find({
      where: { tenantId: tenant.tenantId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async upsertRule(tenant: TenantContext, dto: UpsertReplenishmentRuleDto) {
    await this.assertLocation(tenant.tenantId, dto.locationId);
    await this.assertProduct(tenant.tenantId, dto.itemId);
    if (dto.sourceLocationId) await this.assertLocation(tenant.tenantId, dto.sourceLocationId);
    if (dto.supplierId) await this.assertSupplier(tenant.tenantId, dto.supplierId);

    const entity = dto.id
      ? await this.rules.findOne({ where: { id: dto.id, tenantId: tenant.tenantId } })
      : this.rules.create({ tenantId: tenant.tenantId });
    if (!entity) throw new NotFoundException('Replenishment rule not found');

    entity.locationId = dto.locationId;
    entity.itemId = dto.itemId;
    entity.ruleType = dto.ruleType;
    entity.minLevel = dto.minLevel === undefined ? null : formatQty(dto.minLevel);
    entity.maxLevel = dto.maxLevel === undefined ? null : formatQty(dto.maxLevel);
    entity.safetyStock = dto.safetyStock === undefined ? null : formatQty(dto.safetyStock);
    entity.reorderMultiple = dto.reorderMultiple === undefined ? null : formatQty(dto.reorderMultiple);
    entity.supplierId = dto.supplierId ?? null;
    entity.sourceLocationId = dto.sourceLocationId ?? null;
    entity.isActive = dto.isActive ?? true;
    return this.rules.save(entity);
  }

  listActions(tenant: TenantContext, query: ReplenishmentActionQueryDto) {
    return this.actions.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.locationId ? { locationId: query.locationId } : {}),
        ...(query.itemId ? { itemId: query.itemId } : {}),
      },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async dashboard(tenant: TenantContext, query: ReplenishmentDashboardQueryDto) {
    if (query.locationId) await this.assertLocation(tenant.tenantId, query.locationId);
    const horizonDays = query.horizonDays ?? 14;
    const riskWindowDays = query.riskWindowDays ?? 7;
    const rows = await this.buildDashboardRows(tenant, { ...query, horizonDays, riskWindowDays });
    const stockoutAlerts = rows.filter((row) => row.alertType === 'stockout_risk');
    const overstockAlerts = rows.filter((row) => row.alertType === 'overstocked');
    const suggestedPurchaseOrders = this.groupSuggestedPurchaseOrders(rows.filter((row) => row.recommendedReorderQty > 0));
    const draftPurchaseOrders = await this.purchaseOrderRepository.find({
      where: {
        tenantId: tenant.tenantId,
        status: PurchaseOrderStatus.DRAFT,
        ...(query.locationId ? { locationId: query.locationId } : {}),
      },
      relations: { supplier: true, location: true, items: { item: true } },
      order: { createdAt: 'DESC' },
      take: 25,
    });
    return {
      horizonDays,
      riskWindowDays,
      lowStockItems: rows.filter((row) => ['stockout_risk', 'low_stock'].includes(row.alertType)),
      alerts: {
        stockoutRisk: stockoutAlerts,
        overstocked: overstockAlerts,
      },
      suggestedPurchaseOrders,
      draftPurchaseOrders,
      metrics: {
        lowStockItems: rows.filter((row) => ['stockout_risk', 'low_stock'].includes(row.alertType)).length,
        stockoutRiskItems: stockoutAlerts.length,
        overstockedItems: overstockAlerts.length,
        suggestedPurchaseOrders: suggestedPurchaseOrders.length,
        suggestedValue: suggestedPurchaseOrders.reduce((sum, group) => sum + Number(group.estimatedTotal), 0).toFixed(2),
      },
    };
  }

  async generatePurchaseOrderSuggestions(tenant: TenantContext, dto: GeneratePurchaseOrderSuggestionsDto) {
    const dashboard = await this.dashboard(tenant, dto);
    if (dto.dryRun) return { dryRun: true, purchaseOrders: [], suggestions: dashboard.suggestedPurchaseOrders };
    const purchaseOrders: PurchaseOrderEntity[] = [];
    for (const suggestion of dashboard.suggestedPurchaseOrders) {
      if (!suggestion.supplierId || !suggestion.items.length) continue;
      const maxLeadTime = Math.max(1, ...suggestion.items.map((item) => item.leadTimeDays || 1));
      const expectedDeliveryDate = new Date(Date.now() + maxLeadTime * 86_400_000).toISOString().slice(0, 10);
      const order = await this.purchaseOrders.create(tenant.tenantId, {
        supplierId: suggestion.supplierId,
        locationId: suggestion.locationId,
        status: PurchaseOrderStatus.DRAFT,
        expectedDeliveryDate,
        items: suggestion.items.map((item) => ({
          itemId: item.productId,
          quantityOrdered: item.recommendedReorderQty,
          costPrice: Number(item.costPrice),
        })),
      });
      purchaseOrders.push(order as PurchaseOrderEntity);
      await this.actions.save(this.actions.create({
        tenantId: tenant.tenantId,
        ruleId: null,
        locationId: suggestion.locationId,
        itemId: suggestion.items[0].productId,
        stockItemId: null,
        actionType: 'create_po',
        quantity: formatQty(suggestion.items.reduce((sum, item) => sum + item.recommendedReorderQty, 0)),
        sourceLocationId: null,
        supplierId: suggestion.supplierId,
        status: 'completed',
        purchaseOrderId: order.id,
        stockTransferId: null,
        pickTaskId: null,
        reason: 'Forecast-based purchase order suggestion generated from replenishment dashboard',
        metadata: {
          estimatedCost: suggestion.estimatedSubtotal,
          estimatedTax: suggestion.estimatedTax,
          estimatedTotal: suggestion.estimatedTotal,
          itemCount: suggestion.items.length,
        },
        error: null,
      }));
    }
    if (purchaseOrders.length) {
      await this.notifications.dispatchEvent(tenant.tenantId, 'replenishment.suggestion', {
        itemCount: dashboard.suggestedPurchaseOrders.reduce((sum, suggestion) => sum + suggestion.items.length, 0),
        suggestedValue: dashboard.metrics.suggestedValue,
        purchaseOrderCount: purchaseOrders.length,
      }, { channel: NotificationChannelType.PUSH, type: NotificationType.REPLENISHMENT }).catch(() => undefined);
    }
    return { dryRun: false, purchaseOrders, suggestions: dashboard.suggestedPurchaseOrders };
  }

  async approveSuggestedPurchaseOrder(tenant: TenantContext, dto: ApproveSuggestedPurchaseOrderDto) {
    const order = await this.purchaseOrders.get(tenant.tenantId, dto.purchaseOrderId) as PurchaseOrderEntity;
    if (order.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft suggested purchase orders can be approved');
    }
    return this.purchaseOrders.update(tenant.tenantId, {
      id: order.id,
      supplierId: order.supplierId,
      locationId: order.locationId,
      status: PurchaseOrderStatus.SENT,
      expectedDeliveryDate: order.expectedDeliveryDate ?? undefined,
      supplierStatus: order.supplierStatus,
      supplierExpectedDeliveryDate: order.supplierExpectedDeliveryDate ?? undefined,
      supplierNotes: order.supplierNotes ?? undefined,
      items: (dto.items?.length ? dto.items : order.items.map((item) => ({
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        costPrice: Number(item.costPrice),
      }))).map((item) => ({
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        costPrice: item.costPrice,
      })),
    });
  }

  async run(tenant: TenantContext, dto: RunReplenishmentDto) {
    if (dto.locationId) await this.assertLocation(tenant.tenantId, dto.locationId);
    if (dto.itemId) await this.assertProduct(tenant.tenantId, dto.itemId);

    const rules = await this.rules.find({
      where: {
        tenantId: tenant.tenantId,
        isActive: true,
        ...(dto.locationId ? { locationId: dto.locationId } : {}),
        ...(dto.itemId ? { itemId: dto.itemId } : {}),
      },
      order: { createdAt: 'ASC' },
    });
    const forecast = await this.forecasts.getInventory(tenant, {
      locationId: dto.locationId,
      horizonDays: 14,
    }).catch(() => ({ reorderRecommendations: [] }));
    const forecastByProduct = this.forecastByProduct(forecast);
    const candidates = await Promise.all(rules.map((rule) => this.evaluateRule(tenant.tenantId, rule, forecastByProduct)));
    const actionable = candidates.filter((candidate): candidate is Candidate => Boolean(candidate && candidate.requiredQuantity > 0));
    const created: ReplenishmentActionEntity[] = [];
    const skipped: Array<{ ruleId: string; reason: string }> = [];

    for (const candidate of actionable) {
      const duplicate = await this.actions.findOne({
        where: {
          tenantId: tenant.tenantId,
          locationId: candidate.rule.locationId,
          itemId: candidate.rule.itemId,
          status: 'pending',
        },
      });
      if (duplicate) {
        skipped.push({ ruleId: candidate.rule.id, reason: 'Pending replenishment action already exists' });
        continue;
      }
      if (dto.dryRun) {
        skipped.push({ ruleId: candidate.rule.id, reason: `Dry run preview: ${candidate.reason}` });
        continue;
      }
      created.push(await this.createAction(tenant, candidate));
    }

    if (actionable.length) {
      await this.notifications.dispatchEvent(tenant.tenantId, 'inventory.low', {
        itemName: actionable[0].product.name,
        stockLevel: actionable[0].available,
        reorderPoint: actionable[0].requiredQuantity,
        itemCount: actionable.length,
        message: `${actionable.length} item(s) need replenishment.`,
      }, { channel: NotificationChannelType.PUSH, type: NotificationType.LOW_STOCK }).catch(() => undefined);
    }

    return {
      evaluatedRules: rules.length,
      createdActions: created.length,
      skipped,
      actions: created,
      analytics: {
        stockoutsPrevented: created.filter((action) => action.actionType !== 'alert').length,
        replenishmentCost: created.reduce((sum, action) => sum + Number(action.metadata.estimatedCost ?? 0), 0).toFixed(2),
        transferEfficiency: created.length ? Number((created.filter((action) => action.actionType === 'create_transfer').length / created.length).toFixed(2)) : 0,
        supplierDelays: 0,
        overstockReduction: actionable.filter((candidate) => candidate.rule.maxLevel !== null).length,
      },
    };
  }

  private async buildDashboardRows(
    tenant: TenantContext,
    query: ReplenishmentDashboardQueryDto & { horizonDays: number; riskWindowDays: number },
  ): Promise<ReplenishmentDashboardRow[]> {
    const [forecast, stockItems, rules, supplierItems] = await Promise.all([
      this.forecasts.getInventory(tenant, {
        locationId: query.locationId,
        horizonDays: query.horizonDays,
      }).catch(() => ({ reorderRecommendations: [], stockoutPredictions: [] })),
      this.stockItems.find({
        where: {
          tenantId: tenant.tenantId,
          isActive: true,
          ...(query.locationId ? { locationId: query.locationId } : {}),
        },
        take: 300,
      }),
      this.rules.find({ where: { tenantId: tenant.tenantId, isActive: true } }),
      this.supplierItems.find({
        where: { supplier: { tenantId: tenant.tenantId, isActive: true } },
        relations: { supplier: true, item: true },
      }),
    ]);
    const forecastRows = this.forecastByProduct(forecast);
    const ruleByLocationProduct = new Map(rules.map((rule) => [`${rule.locationId}:${rule.itemId}`, rule]));
    const supplierByProduct = new Map<string, SupplierItemEntity>();
    for (const item of supplierItems) {
      const existing = supplierByProduct.get(item.itemId);
      if (!existing || item.leadTimeDays < existing.leadTimeDays) supplierByProduct.set(item.itemId, item);
    }

    return stockItems
      .filter((stock) => stock.productId)
      .map((stock) => {
        const productId = stock.productId!;
        const forecast = forecastRows.get(productId) ?? {};
        const rule = ruleByLocationProduct.get(`${stock.locationId}:${productId}`) ?? null;
        const supplier = rule?.supplierId
          ? supplierItems.find((item) => item.itemId === productId && item.supplierId === rule.supplierId) ?? supplierByProduct.get(productId)
          : supplierByProduct.get(productId);
        const available = availableQty(stock.quantityOnHand, stock.quantityReserved);
        const forecastedDemand = Number(forecast.forecastedDemand ?? 0);
        const daysUntilStockout = forecast.daysUntilStockout === null || forecast.daysUntilStockout === undefined
          ? null
          : Number(forecast.daysUntilStockout);
        const safetyStock = parseQty(rule?.safetyStock ?? stock.safetyStockLevel ?? '0');
        const reorderMultiple = Math.max(1, parseQty(rule?.reorderMultiple ?? '0'));
        const caseSize = Math.max(1, supplier?.caseSize ?? Math.ceil(reorderMultiple));
        const minOrderQty = Math.max(1, supplier?.minOrderQty ?? 1);
        const leadTimeDays = Math.max(1, supplier?.leadTimeDays ?? query.riskWindowDays);
        const baselineQty = Math.max(
          Number(forecast.suggestedQuantity ?? forecast.recommendedReorderQty ?? 0),
          forecastedDemand + safetyStock - available,
          parseQty(rule?.minLevel ?? stock.reorderPoint ?? stock.reorderLevel ?? '0') - available,
          0,
        );
        const roundedQty = baselineQty > 0 ? this.roundOrderQuantity(Math.max(baselineQty, minOrderQty), caseSize) : 0;
        const depletionDate = daysUntilStockout === null
          ? null
          : new Date(Date.now() + Math.max(0, Math.floor(daysUntilStockout)) * 86_400_000).toISOString().slice(0, 10);
        const reorderDate = daysUntilStockout === null
          ? null
          : new Date(Date.now() + Math.max(0, Math.floor(daysUntilStockout - leadTimeDays)) * 86_400_000).toISOString().slice(0, 10);
        const riskScore = this.stockoutRiskScore(daysUntilStockout, query.riskWindowDays, available, safetyStock);
        const overstocked = forecastedDemand > 0 && available > forecastedDemand * 3 + safetyStock;
        const lowStock = available <= Math.max(safetyStock, parseQty(stock.reorderLevel ?? stock.reorderPoint ?? '0'));
        const alertType: ReplenishmentDashboardRow['alertType'] = riskScore >= 70
          ? 'stockout_risk'
          : overstocked
            ? 'overstocked'
            : lowStock
              ? 'low_stock'
              : 'healthy';
        return {
          productId,
          name: stock.name,
          locationId: stock.locationId,
          available,
          forecastedDemand,
          daysUntilStockout,
          forecastedDepletionDate: depletionDate,
          recommendedReorderDate: reorderDate,
          recommendedReorderQty: roundedQty,
          riskScore,
          alertType,
          supplierId: supplier?.supplierId ?? null,
          supplierName: supplier?.supplier?.name ?? null,
          leadTimeDays,
          minOrderQty,
          caseSize,
          estimatedCost: (roundedQty * Number(supplier?.costPrice ?? 0)).toFixed(2),
        };
      })
      .filter((row) => row.alertType !== 'healthy' || row.recommendedReorderQty > 0)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  private groupSuggestedPurchaseOrders(rows: ReplenishmentDashboardRow[]) {
    const groups = new Map<string, {
      supplierId: string | null;
      supplierName: string | null;
      locationId: string;
      estimatedSubtotal: string;
      estimatedTax: string;
      estimatedTotal: string;
      items: Array<ReplenishmentDashboardRow & { costPrice: string }>;
    }>();
    for (const row of rows) {
      if (!row.supplierId) continue;
      const key = `${row.supplierId}:${row.locationId}`;
      const group = groups.get(key) ?? {
        supplierId: row.supplierId,
        supplierName: row.supplierName,
        locationId: row.locationId,
        estimatedSubtotal: '0.00',
        estimatedTax: '0.00',
        estimatedTotal: '0.00',
        items: [],
      };
      const costPrice = row.recommendedReorderQty > 0
        ? (Number(row.estimatedCost) / row.recommendedReorderQty).toFixed(2)
        : '0.00';
      group.items.push({ ...row, costPrice });
      const subtotal = group.items.reduce((sum, item) => sum + Number(item.estimatedCost), 0);
      group.estimatedSubtotal = subtotal.toFixed(2);
      group.estimatedTax = '0.00';
      group.estimatedTotal = subtotal.toFixed(2);
      groups.set(key, group);
    }
    return [...groups.values()].sort((a, b) => Number(b.estimatedTotal) - Number(a.estimatedTotal));
  }

  private roundOrderQuantity(quantity: number, caseSize: number): number {
    return Math.ceil(quantity / Math.max(1, caseSize)) * Math.max(1, caseSize);
  }

  private stockoutRiskScore(daysUntilStockout: number | null, riskWindowDays: number, available: number, safetyStock: number) {
    if (available <= 0) return 100;
    if (daysUntilStockout === null) return available <= safetyStock ? 45 : 0;
    if (daysUntilStockout <= 0) return 100;
    if (daysUntilStockout >= riskWindowDays * 2) return 0;
    return Math.max(0, Math.min(100, Math.round((1 - daysUntilStockout / (riskWindowDays * 2)) * 100)));
  }

  private async evaluateRule(
    tenantId: string,
    rule: ReplenishmentRuleEntity,
    forecastByProduct: Map<string, Record<string, unknown>>,
  ): Promise<Candidate | null> {
    const product = await this.products.findOne({ where: { id: rule.itemId, tenantId } });
    if (!product) return null;
    const stockItem = await this.stockItems.findOne({
      where: { tenantId, locationId: rule.locationId, productId: rule.itemId },
    });
    const available = stockItem ? availableQty(stockItem.quantityOnHand, stockItem.quantityReserved) : 0;
    const forecast = forecastByProduct.get(rule.itemId);
    const projectedDemand = Number(forecast?.forecastedDemand ?? 0);
    const safetyStock = parseQty(rule.safetyStock ?? '0');
    const minLevel = parseQty(rule.minLevel ?? rule.safetyStock ?? '0');
    const maxLevel = parseQty(rule.maxLevel ?? '0');
    const triggerLevel = rule.ruleType === 'forecast_based'
      ? projectedDemand + safetyStock
      : rule.ruleType === 'safety_stock'
        ? safetyStock
        : minLevel;
    if (available > triggerLevel) return null;

    const targetLevel = maxLevel > 0 ? maxLevel : Math.max(triggerLevel + projectedDemand, minLevel + safetyStock);
    let requiredQuantity = Math.max(0, targetLevel - available);
    const multiple = parseQty(rule.reorderMultiple ?? '0');
    if (multiple > 0 && requiredQuantity > 0) {
      requiredQuantity = Math.ceil(requiredQuantity / multiple) * multiple;
    }
    return {
      rule,
      stockItem,
      product,
      available,
      projectedDemand,
      requiredQuantity,
      reason: `${rule.ruleType} rule projected ${available.toFixed(2)} available against ${triggerLevel.toFixed(2)} threshold`,
    };
  }

  private async createAction(tenant: TenantContext, candidate: Candidate) {
    const source = await this.findSourceStock(tenant.tenantId, candidate);
    if (source) {
      return this.createTransferAction(tenant, candidate, source);
    }
    const supplierItem = await this.findSupplierItem(tenant.tenantId, candidate.rule.supplierId, candidate.rule.itemId);
    if (supplierItem) {
      return this.createPurchaseOrderAction(tenant, candidate, supplierItem);
    }
    const action = this.actions.create(this.baseAction(tenant.tenantId, candidate, 'alert'));
    action.status = 'pending';
    action.reason = `${candidate.reason}; no supplier or source location could fulfill automatically`;
    return this.actions.save(action);
  }

  private async createPurchaseOrderAction(
    tenant: TenantContext,
    candidate: Candidate,
    supplierItem: SupplierItemEntity,
  ) {
    const expected = new Date(Date.now() + Math.max(1, supplierItem.leadTimeDays || 1) * 24 * 60 * 60 * 1000);
    const action = await this.actions.save(this.actions.create({
      ...this.baseAction(tenant.tenantId, candidate, 'create_po'),
      supplierId: supplierItem.supplierId,
      metadata: {
        leadTimeDays: supplierItem.leadTimeDays,
        estimatedCost: (candidate.requiredQuantity * Number(supplierItem.costPrice)).toFixed(2),
      },
    }));
    try {
      const order = await this.purchaseOrders.create(tenant.tenantId, {
        supplierId: supplierItem.supplierId,
        locationId: candidate.rule.locationId,
        status: PurchaseOrderStatus.DRAFT,
        expectedDeliveryDate: expected.toISOString().slice(0, 10),
        items: [{
          itemId: candidate.rule.itemId,
          quantityOrdered: Math.ceil(candidate.requiredQuantity),
          costPrice: Number(supplierItem.costPrice),
        }],
      });
      action.status = 'completed';
      action.purchaseOrderId = order.id;
      action.reason = `${candidate.reason}; auto-generated purchase order`;
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Failed to create purchase order';
    }
    return this.actions.save(action);
  }

  private async createTransferAction(
    tenant: TenantContext,
    candidate: Candidate,
    source: StockItemEntity,
  ) {
    const action = await this.actions.save(this.actions.create({
      ...this.baseAction(tenant.tenantId, candidate, 'create_transfer'),
      sourceLocationId: source.locationId,
    }));
    try {
      const transfer = await this.stockTransfers.create(tenant, {
        fromLocationId: source.locationId,
        toLocationId: candidate.rule.locationId,
        status: StockTransferStatus.DRAFT,
        notes: `Auto-generated replenishment for ${candidate.product.name}`,
        lines: [{ stockItemId: source.id, quantity: Math.ceil(candidate.requiredQuantity) }],
      });
      const pickTask = await this.warehouse.createPickForTransfer(tenant.tenantId, {
        id: transfer.id,
        fromLocationId: transfer.fromLocationId,
      } as Pick<StockTransferEntity, 'id' | 'fromLocationId'>);
      action.status = 'completed';
      action.stockTransferId = transfer.id;
      action.pickTaskId = pickTask.id;
      action.reason = `${candidate.reason}; auto-generated transfer and pick task`;
    } catch (error) {
      action.status = 'failed';
      action.error = error instanceof Error ? error.message : 'Failed to create transfer';
    }
    return this.actions.save(action);
  }

  private baseAction(
    tenantId: string,
    candidate: Candidate,
    actionType: ReplenishmentActionType,
  ): Partial<ReplenishmentActionEntity> {
    return {
      tenantId,
      ruleId: candidate.rule.id,
      locationId: candidate.rule.locationId,
      itemId: candidate.rule.itemId,
      stockItemId: candidate.stockItem?.id ?? null,
      actionType,
      quantity: formatQty(candidate.requiredQuantity),
      sourceLocationId: null,
      supplierId: candidate.rule.supplierId,
      status: 'pending',
      purchaseOrderId: null,
      stockTransferId: null,
      pickTaskId: null,
      reason: candidate.reason,
      metadata: {
        available: candidate.available,
        projectedDemand: candidate.projectedDemand,
        productName: candidate.product.name,
      },
      error: null,
    };
  }

  private async findSourceStock(tenantId: string, candidate: Candidate) {
    const rule = candidate.rule;
    const qb = this.stockItems
      .createQueryBuilder('stock')
      .innerJoin(LocationEntity, 'location', 'location.id = stock.location_id')
      .where('stock.tenant_id = :tenantId', { tenantId })
      .andWhere('stock.product_id = :itemId', { itemId: rule.itemId })
      .andWhere('stock.location_id != :locationId', { locationId: rule.locationId });
    if (rule.sourceLocationId) {
      qb.andWhere('stock.location_id = :sourceLocationId', { sourceLocationId: rule.sourceLocationId });
    } else {
      qb.andWhere('location.location_type IN (:...sourceTypes)', {
        sourceTypes: [LocationType.WAREHOUSE, LocationType.DARK_STORE, LocationType.DISTRIBUTION_CENTER],
      });
    }
    const rows = await qb.getMany();
    return rows
      .filter((row) => availableQty(row.quantityOnHand, row.quantityReserved) >= candidate.requiredQuantity)
      .sort((a, b) => availableQty(b.quantityOnHand, b.quantityReserved) - availableQty(a.quantityOnHand, a.quantityReserved))[0] ?? null;
  }

  private async findSupplierItem(tenantId: string, supplierId: string | null, itemId: string) {
    const qb = this.supplierItems
      .createQueryBuilder('supplierItem')
      .innerJoin('supplierItem.supplier', 'supplier')
      .where('supplier.tenant_id = :tenantId', { tenantId })
      .andWhere('supplierItem.item_id = :itemId', { itemId })
      .andWhere('supplier.is_active = true');
    if (supplierId) qb.andWhere('supplierItem.supplier_id = :supplierId', { supplierId });
    return qb.orderBy('supplierItem.lead_time_days', 'ASC').getOne();
  }

  private forecastByProduct(forecast: unknown) {
    const map = new Map<string, Record<string, unknown>>();
    const payload = forecast && typeof forecast === 'object' ? forecast as Record<string, unknown> : {};
    const recommendations = payload.reorderRecommendations;
    if (!Array.isArray(recommendations)) return map;
    for (const item of recommendations) {
      if (item && typeof item === 'object' && 'productId' in item) {
        map.set(String((item as Record<string, unknown>).productId), item as Record<string, unknown>);
      }
    }
    return map;
  }

  private async assertLocation(tenantId: string, locationId: string) {
    const exists = await this.locations.exists({ where: { tenantId, id: locationId } });
    if (!exists) throw new BadRequestException('Location is invalid');
  }

  private async assertProduct(tenantId: string, itemId: string) {
    const exists = await this.products.exists({ where: { tenantId, id: itemId } });
    if (!exists) throw new BadRequestException('Item is invalid');
  }

  private async assertSupplier(tenantId: string, supplierId: string) {
    const exists = await this.suppliers.exists({ where: { tenantId, id: supplierId } });
    if (!exists) throw new BadRequestException('Supplier is invalid');
  }
}
