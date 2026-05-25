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
import { PurchaseOrderStatus, SupplierEntity, SupplierItemEntity } from '../../procurement/entities';
import { PurchaseOrdersService } from '../../procurement/services';
import { LocationEntity, LocationType } from '../../tenants/entities';
import { WarehouseService } from '../../warehouse/services';
import { ReplenishmentActionQueryDto, RunReplenishmentDto, UpsertReplenishmentRuleDto } from '../dto';
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
    private readonly purchaseOrders: PurchaseOrdersService,
    private readonly stockTransfers: StockTransfersService,
    private readonly warehouse: WarehouseService,
    private readonly forecasts: ForecastService,
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
