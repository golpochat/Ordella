import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { StockItemEntity } from '../../inventory/entities';
import { availableQty } from '../../inventory/domain/stock-quantity.util';
import { OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { TenantSettingsEntity } from '../../onboarding/entities/tenant-settings.entity';
import { LocationEntity } from '../../tenants/entities';
import { LocationOpeningHoursEntity } from '../../tenants/entities/location-opening-hours.entity';
import { LocationStatus } from '../../tenants/enums/location-status.enum';
import { LocationType } from '../../tenants/enums/location-type.enum';
import { DecideRoutingDto, RoutingDecisionQueryDto, UpsertRoutingRuleDto } from '../dto';
import { RoutingDecisionEntity, RoutingRuleEntity } from '../entities';

type Candidate = {
  location: LocationEntity;
  score: number;
  reason: string;
  estimatedDeliveryMinutes: number;
  availableStock: boolean;
  zoneMatch: boolean;
  openNow: boolean;
  fallbackTier: 'nearest-location' | 'dark-store-fallback' | 'warehouse-fallback';
  capacityLoad: number;
  distanceScore: number;
};

type DeliveryConfig = {
  deliveryEnabled: boolean;
  deliveryRadiusKm: number;
  minimumOrderAmount: number;
  deliveryZones: Array<Record<string, unknown>>;
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
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettings: Repository<TenantSettingsEntity>,
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
    const deliveryConfig = await this.deliveryConfig(tenant.tenantId);
    if (orderType === 'delivery') {
      if (!deliveryConfig.deliveryEnabled) {
        throw new BadRequestException('Delivery is disabled for this tenant');
      }
      if (dto.orderSubtotal !== undefined && dto.orderSubtotal < deliveryConfig.minimumOrderAmount) {
        throw new BadRequestException(`Delivery requires a minimum order of ${deliveryConfig.minimumOrderAmount.toFixed(2)}`);
      }
    }
    const locations = await this.locations.find({
      where: { tenantId: tenant.tenantId },
      relations: { openingHours: true },
    });
    const activeRules = await this.rules.find({ where: { tenantId: tenant.tenantId, isActive: true } });
    const candidates = await Promise.all(
      locations
        .filter((location) => this.supportsOrderType(location, orderType))
        .map((location) => this.scoreLocation(tenant.tenantId, location, dto, activeRules, deliveryConfig)),
    );
    const valid = candidates
      .filter((candidate) => candidate.availableStock && candidate.zoneMatch && candidate.openNow)
      .sort((a, b) => this.fallbackRank(a.fallbackTier) - this.fallbackRank(b.fallbackTier) || b.score - a.score);
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
        deliveryConfig,
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
    deliveryConfig: DeliveryConfig,
  ): Promise<Candidate> {
    const capacityLoad = await this.capacityLoad(tenantId, location.id);
    const distanceScore = this.distanceScore(location, dto.customerAddress);
    const zoneMatch = this.zoneMatches(location, dto.customerAddress, deliveryConfig);
    const openNow = this.isOpenNow(location);
    const availableStock = await this.hasStock(tenantId, location.id, dto.items ?? []);
    const weights = this.weights(rules);
    const fallbackTier = this.fallbackTier(location);
    const capacityRatio = location.fulfillmentCapacity > 0 ? capacityLoad / location.fulfillmentCapacity : 1;
    const score =
      location.routingPriority * weights.priority -
      distanceScore * weights.distance -
      capacityRatio * weights.capacity +
      (availableStock ? weights.stock : -1000) +
      (zoneMatch ? weights.delivery_zone : -1000) +
      (openNow ? 0 : -1000);
    const estimatedDeliveryMinutes = Math.max(15, Math.round(20 + distanceScore * 3 + capacityRatio * 15));
    const reason = [
      `${location.name} scored ${score.toFixed(2)}`,
      availableStock ? 'stock available' : 'stock unavailable',
      zoneMatch ? 'zone matched' : 'outside delivery zone',
      openNow ? 'location open' : 'location closed by hours',
      fallbackTier.replace(/-/g, ' '),
      `capacity ${capacityLoad}/${location.fulfillmentCapacity}`,
      `priority ${location.routingPriority}`,
    ].join('; ');
    return {
      location,
      score,
      reason,
      estimatedDeliveryMinutes,
      availableStock,
      zoneMatch,
      openNow,
      fallbackTier,
      capacityLoad,
      distanceScore,
    };
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

  private zoneMatches(
    location: LocationEntity,
    address: DecideRoutingDto['customerAddress'] | undefined,
    deliveryConfig: DeliveryConfig,
  ) {
    const zones = [
      ...(Array.isArray(location.deliveryZones) ? location.deliveryZones : []),
      ...deliveryConfig.deliveryZones,
    ];
    if (!zones.length || !address) return true;
    if (typeof address.lat === 'number' && typeof address.lng === 'number') {
      return zones.some((zone) => this.geoZoneMatches(zone, address.lat!, address.lng!, deliveryConfig.deliveryRadiusKm));
    }
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
    if (typeof address?.lat === 'number' && typeof address.lng === 'number') {
      const coordinates = this.locationCoordinates(location);
      if (coordinates) return this.haversineKm(coordinates.lat, coordinates.lng, address.lat, address.lng);
    }
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
      openNow: candidate.openNow,
      routingRule: candidate.fallbackTier,
      capacityLoad: candidate.capacityLoad,
      routingPriority: candidate.location.routingPriority,
    };
  }

  private async deliveryConfig(tenantId: string): Promise<DeliveryConfig> {
    const settings = await this.tenantSettings.findOne({ where: { tenantId } });
    return {
      deliveryEnabled: settings?.deliveryEnabled ?? true,
      deliveryRadiusKm: Number(settings?.deliveryRadiusKm ?? 5),
      minimumOrderAmount: Number(settings?.minimumOrderAmount ?? 0),
      deliveryZones: Array.isArray(settings?.deliveryZones) ? settings.deliveryZones : [],
    };
  }

  private fallbackTier(location: LocationEntity): Candidate['fallbackTier'] {
    if (location.locationType === LocationType.WAREHOUSE || location.locationType === LocationType.DISTRIBUTION_CENTER) {
      return 'warehouse-fallback';
    }
    if (location.locationType === LocationType.DARK_STORE || location.fulfillmentMode === 'dark_store') {
      return 'dark-store-fallback';
    }
    return 'nearest-location';
  }

  private fallbackRank(tier: Candidate['fallbackTier']): number {
    if (tier === 'nearest-location') return 0;
    if (tier === 'dark-store-fallback') return 1;
    return 2;
  }

  private isOpenNow(location: LocationEntity): boolean {
    const hours = (location.openingHours ?? []) as LocationOpeningHoursEntity[];
    if (!hours.length) return true;
    const now = new Date();
    const day = now.getUTCDay();
    const row = hours.find((entry) => entry.dayOfWeek === day);
    if (!row) return true;
    if (row.isClosed) return false;
    if (!row.openTime || !row.closeTime) return true;
    const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const open = this.timeToMinutes(row.openTime);
    const close = this.timeToMinutes(row.closeTime);
    if (open <= close) return minutes >= open && minutes <= close;
    return minutes >= open || minutes <= close;
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
    return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
  }

  private geoZoneMatches(zone: unknown, lat: number, lng: number, fallbackRadiusKm: number): boolean {
    if (!zone || typeof zone !== 'object') return false;
    const record = zone as Record<string, unknown>;
    if (record.type === 'radius') {
      const center = record.center as { lat?: number; lng?: number } | undefined;
      const radiusKm = Number(record.radiusKm ?? fallbackRadiusKm);
      if (typeof center?.lat !== 'number' || typeof center.lng !== 'number') return false;
      return this.haversineKm(center.lat, center.lng, lat, lng) <= radiusKm;
    }
    if (record.type === 'polygon' && Array.isArray(record.points)) {
      const points = record.points as Array<{ lat?: number; lng?: number }>;
      return this.pointInPolygon(lat, lng, points);
    }
    return false;
  }

  private locationCoordinates(location: LocationEntity): { lat: number; lng: number } | null {
    const zones = Array.isArray(location.deliveryZones) ? location.deliveryZones : [];
    for (const zone of zones) {
      if (!zone || typeof zone !== 'object') continue;
      const center = (zone as Record<string, unknown>).center as { lat?: number; lng?: number } | undefined;
      if (typeof center?.lat === 'number' && typeof center.lng === 'number') return center as { lat: number; lng: number };
    }
    return null;
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private pointInPolygon(lat: number, lng: number, points: Array<{ lat?: number; lng?: number }>): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].lng;
      const yi = points[i].lat;
      const xj = points[j].lng;
      const yj = points[j].lat;
      if (typeof xi !== 'number' || typeof yi !== 'number' || typeof xj !== 'number' || typeof yj !== 'number') continue;
      const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }
    return inside;
  }
}
