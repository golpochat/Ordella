import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { StockItemEntity } from '../../inventory/entities';
import { availableQty } from '../../inventory/domain/stock-quantity.util';
import { OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { LocationEntity } from '../../tenants/entities';
import { LocationStatus } from '../../tenants/enums/location-status.enum';
import { DecideRoutingDto, RoutingDecisionQueryDto, UpsertRoutingRuleDto } from '../dto';
import { RoutingDecisionEntity, RoutingRuleEntity } from '../entities';

type Candidate = {
  location: LocationEntity;
  score: number;
  reason: string;
  estimatedDeliveryMinutes: number;
  availableStock: boolean;
  zoneMatch: boolean;
  capacityLoad: number;
  distanceScore: number;
};

@Injectable()
export class RoutingService {
  constructor(
    @InjectRepository(RoutingRuleEntity)
    private readonly rules: Repository<RoutingRuleEntity>,
    @InjectRepository(RoutingDecisionEntity)
    private readonly decisions: Repository<RoutingDecisionEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
  ) {}

  listRules(tenant: TenantContext) {
    return this.rules.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } });
  }

  async upsertRule(tenant: TenantContext, dto: UpsertRoutingRuleDto) {
    const entity = dto.id
      ? await this.rules.findOne({ where: { id: dto.id, tenantId: tenant.tenantId } })
      : this.rules.create({ tenantId: tenant.tenantId });
    if (!entity) throw new NotFoundException('Routing rule not found');
    entity.ruleType = dto.ruleType;
    entity.value = dto.value;
    entity.isActive = dto.isActive ?? true;
    return this.rules.save(entity);
  }

  listDecisions(tenant: TenantContext, query: RoutingDecisionQueryDto) {
    return this.decisions.find({
      where: {
        tenantId: tenant.tenantId,
        ...(query.orderId ? { orderId: query.orderId } : {}),
        ...(query.locationId ? { toLocationId: query.locationId } : {}),
      },
      relations: { fromLocation: true, toLocation: true, order: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  findLatestForOrder(tenantId: string, orderId: string) {
    return this.decisions.findOne({
      where: { tenantId, orderId },
      relations: { toLocation: true },
      order: { createdAt: 'DESC' },
    });
  }

  async decide(tenant: TenantContext, dto: DecideRoutingDto) {
    const orderType = dto.orderType ?? 'delivery';
    const locations = await this.locations.find({ where: { tenantId: tenant.tenantId } });
    const activeRules = await this.rules.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const candidates = await Promise.all(
      locations
        .filter((location) => this.supportsOrderType(location, orderType))
        .map((location) => this.scoreLocation(tenant.tenantId, location, dto, activeRules)),
    );
    const valid = candidates
      .filter((candidate) => candidate.availableStock && candidate.zoneMatch)
      .sort((a, b) => b.score - a.score);
    const selected = valid[0] ?? null;
    const fallbackOptions = valid.slice(1, 4).map((candidate) => this.toCandidateSnapshot(candidate));
    const reason = selected
      ? selected.reason
      : 'No eligible location matched delivery, stock, zone, and capacity requirements';

    const decision = await this.decisions.save(this.decisions.create({
      tenantId: tenant.tenantId,
      orderId: dto.orderId ?? null,
      fromLocationId: dto.fromLocationId ?? null,
      toLocationId: selected?.location.id ?? null,
      reason,
      estimatedDeliveryMinutes: selected?.estimatedDeliveryMinutes ?? null,
      fallbackOptions,
      inputSnapshot: {
        orderType,
        customerAddress: dto.customerAddress ?? null,
        items: dto.items ?? [],
        candidates: candidates.map((candidate) => this.toCandidateSnapshot(candidate)),
      },
    }));

    return {
      decisionId: decision.id,
      selectedLocationId: selected?.location.id ?? null,
      selectedLocationName: selected?.location.name ?? null,
      reason,
      estimatedDeliveryMinutes: selected?.estimatedDeliveryMinutes ?? null,
      fallbackOptions,
      candidates: candidates.map((candidate) => this.toCandidateSnapshot(candidate)),
      canFulfill: Boolean(selected),
    };
  }

  async decideForOrderInput(
    tenant: TenantContext,
    input: DecideRoutingDto,
  ): Promise<Awaited<ReturnType<RoutingService['decide']>>> {
    const result = await this.decide(tenant, input);
    if (!result.selectedLocationId) throw new BadRequestException(result.reason);
    return result;
  }

  async attachOrder(decisionId: string | undefined, tenantId: string, orderId: string) {
    if (!decisionId) return;
    const decision = await this.decisions.findOne({ where: { id: decisionId, tenantId } });
    if (!decision) return;
    decision.orderId = orderId;
    await this.decisions.save(decision);
  }

  private async scoreLocation(
    tenantId: string,
    location: LocationEntity,
    dto: DecideRoutingDto,
    rules: RoutingRuleEntity[],
  ): Promise<Candidate> {
    const capacityLoad = await this.capacityLoad(tenantId, location.id);
    const distanceScore = this.distanceScore(location, dto.customerAddress);
    const zoneMatch = this.zoneMatches(location, dto.customerAddress);
    const availableStock = await this.hasStock(tenantId, location.id, dto.items ?? []);
    const weights = this.weights(rules);
    const capacityRatio = location.fulfillmentCapacity > 0 ? capacityLoad / location.fulfillmentCapacity : 1;
    const score =
      location.routingPriority * weights.priority -
      distanceScore * weights.distance -
      capacityRatio * weights.capacity +
      (availableStock ? weights.stock : -1000) +
      (zoneMatch ? weights.delivery_zone : -1000);
    const estimatedDeliveryMinutes = Math.max(15, Math.round(20 + distanceScore * 3 + capacityRatio * 15));
    const reason = [
      `${location.name} scored ${score.toFixed(2)}`,
      availableStock ? 'stock available' : 'stock unavailable',
      zoneMatch ? 'zone matched' : 'outside delivery zone',
      `capacity ${capacityLoad}/${location.fulfillmentCapacity}`,
      `priority ${location.routingPriority}`,
    ].join('; ');
    return { location, score, reason, estimatedDeliveryMinutes, availableStock, zoneMatch, capacityLoad, distanceScore };
  }

  private supportsOrderType(location: LocationEntity, orderType: string) {
    if (location.status === LocationStatus.CLOSED) return false;
    if (orderType === 'delivery') return location.supportsDelivery;
    if (orderType === 'pickup') return location.supportsPickup;
    return true;
  }

  private async hasStock(tenantId: string, locationId: string, items: Array<{ productId: string; quantity: number }>) {
    if (!items.length) return true;
    const rows = await this.stockItems.find({
      where: { tenantId, locationId, productId: In(items.map((item) => item.productId)) },
    });
    const stock = new Map(rows.map((row) => [row.productId, row]));
    return items.every((item) => {
      const row = stock.get(item.productId);
      if (!row) return true;
      return availableQty(row.quantityOnHand, row.quantityReserved) >= item.quantity;
    });
  }

  private zoneMatches(location: LocationEntity, address?: DecideRoutingDto['customerAddress']) {
    const zones = Array.isArray(location.deliveryZones) ? location.deliveryZones : [];
    if (!zones.length || !address) return true;
    const haystack = [address.addressLine1, address.city, address.postalCode].filter(Boolean).join(' ').toLowerCase();
    return zones.some((zone) => {
      if (typeof zone === 'string') return haystack.includes(zone.toLowerCase());
      if (zone && typeof zone === 'object') {
        const values = Object.values(zone as Record<string, unknown>).flat().map((value) => String(value).toLowerCase());
        return values.some((value) => value && haystack.includes(value));
      }
      return false;
    });
  }

  private distanceScore(location: LocationEntity, address?: DecideRoutingDto['customerAddress']) {
    if (!address) return 5;
    const locationText = [location.address, location.name].filter(Boolean).join(' ').toLowerCase();
    const addressText = [address.addressLine1, address.city, address.postalCode].filter(Boolean).join(' ').toLowerCase();
    if (!addressText) return 5;
    if (address.city && locationText.includes(address.city.toLowerCase())) return 1;
    if (address.postalCode && locationText.includes(address.postalCode.toLowerCase())) return 1;
    return Math.min(10, Math.max(2, addressText.split(/\s+/).filter((part) => locationText.includes(part)).length ? 4 : 8));
  }

  private async capacityLoad(tenantId: string, locationId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.orders.count({
      where: {
        tenantId,
        locationId,
        createdAt: MoreThanOrEqual(oneHourAgo),
        status: In([OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY]),
      },
    });
  }

  private weights(rules: RoutingRuleEntity[]) {
    const defaults = { distance: 1, stock: 100, capacity: 20, priority: 10, delivery_zone: 100 };
    for (const rule of rules) {
      const weight = Number(rule.value.weight);
      if (!Number.isFinite(weight)) continue;
      defaults[rule.ruleType] = weight;
    }
    return defaults;
  }

  private toCandidateSnapshot(candidate: Candidate) {
    return {
      locationId: candidate.location.id,
      locationName: candidate.location.name,
      score: Number(candidate.score.toFixed(2)),
      reason: candidate.reason,
      estimatedDeliveryMinutes: candidate.estimatedDeliveryMinutes,
      availableStock: candidate.availableStock,
      zoneMatch: candidate.zoneMatch,
      capacityLoad: candidate.capacityLoad,
      routingPriority: candidate.location.routingPriority,
    };
  }
}
