import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { UserEntity } from '../../auth/entities';
import { DeliveryTaskEntity } from '../../deliveries/entities';
import { DeliveryTaskStatus } from '../../deliveries/enums/delivery-task-status.enum';
import { StockItemEntity } from '../../inventory/entities';
import { OrderEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { LocationEntity, TenantEntity, UserLocationAssignmentEntity } from '../../tenants/entities';
import {
  AssignEnterpriseAccessDto,
  AssignRegionLocationsDto,
  CreateEnterpriseOrganizationDto,
  CreateEnterpriseRegionDto,
  UpdateEnterpriseSettingsDto,
} from '../dto';
import {
  EnterpriseAccessAssignmentEntity,
  EnterpriseOrganizationEntity,
  EnterpriseRegionEntity,
  EnterpriseScopeType,
} from '../entities';

const EXCLUDED_ORDER_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectRepository(EnterpriseOrganizationEntity)
    private readonly organizations: Repository<EnterpriseOrganizationEntity>,
    @InjectRepository(EnterpriseRegionEntity)
    private readonly regions: Repository<EnterpriseRegionEntity>,
    @InjectRepository(EnterpriseAccessAssignmentEntity)
    private readonly accessAssignments: Repository<EnterpriseAccessAssignmentEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(UserLocationAssignmentEntity)
    private readonly userLocations: Repository<UserLocationAssignmentEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(DeliveryTaskEntity)
    private readonly deliveries: Repository<DeliveryTaskEntity>,
    private readonly auditLogs: AuditLogService,
  ) {}

  async hierarchy(tenant: TenantContext, user?: AuthenticatedUser) {
    const organization = await this.ensureOrganization(tenant);
    const [regions, locations, assignments] = await Promise.all([
      this.regions.find({ where: { tenantId: tenant.tenantId, organizationId: organization.id }, order: { name: 'ASC' } }),
      this.locations.find({ where: { tenantId: tenant.tenantId }, order: { name: 'ASC' } }),
      this.accessAssignments.find({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'DESC' } }),
    ]);
    const allowedLocationIds = await this.resolveAllowedLocationIds(tenant.tenantId, user);
    const visibleLocations = allowedLocationIds ? locations.filter((location) => allowedLocationIds.includes(location.id)) : locations;
    await this.audit(tenant, user, 'enterprise.view_hierarchy', organization.id, { visibleLocations: visibleLocations.length });
    return {
      organization,
      regions,
      locations: visibleLocations,
      assignments,
      permissionMatrix: this.permissionMatrix(),
    };
  }

  async createOrganization(tenant: TenantContext, dto: CreateEnterpriseOrganizationDto, user?: AuthenticatedUser) {
    const name = dto.name.trim();
    const organization = await this.organizations.save(this.organizations.create({
      tenantId: tenant.tenantId,
      name,
      slug: dto.slug?.trim() || this.slugify(name),
      status: 'active',
      globalSettings: {},
      taxRules: {},
      promotionPolicy: {},
      catalogPolicy: {},
      ssoPolicy: {},
    }));
    await this.audit(tenant, user, 'enterprise.organization.created', organization.id, { name: organization.name });
    return organization;
  }

  async updateSettings(tenant: TenantContext, id: string, dto: UpdateEnterpriseSettingsDto, user?: AuthenticatedUser) {
    const organization = await this.requireOrganization(tenant.tenantId, id);
    if (dto.globalSettings !== undefined) organization.globalSettings = dto.globalSettings;
    if (dto.taxRules !== undefined) organization.taxRules = dto.taxRules;
    if (dto.promotionPolicy !== undefined) organization.promotionPolicy = dto.promotionPolicy;
    if (dto.catalogPolicy !== undefined) organization.catalogPolicy = dto.catalogPolicy;
    if (dto.ssoPolicy !== undefined) organization.ssoPolicy = dto.ssoPolicy;
    organization.updatedAt = new Date();
    const saved = await this.organizations.save(organization);
    await this.audit(tenant, user, 'enterprise.settings.updated', organization.id, { changed: Object.keys(dto) });
    return saved;
  }

  async createRegion(tenant: TenantContext, dto: CreateEnterpriseRegionDto, user?: AuthenticatedUser) {
    await this.requireOrganization(tenant.tenantId, dto.organizationId);
    if (dto.parentRegionId) await this.requireRegion(tenant.tenantId, dto.parentRegionId);
    const region = await this.regions.save(this.regions.create({
      tenantId: tenant.tenantId,
      organizationId: dto.organizationId,
      parentRegionId: dto.parentRegionId ?? null,
      name: dto.name.trim(),
      regionType: dto.regionType ?? 'custom',
      country: dto.country ?? null,
      state: dto.state ?? null,
      overrides: dto.overrides ?? {},
      metadata: {},
    }));
    await this.audit(tenant, user, 'enterprise.region.created', region.id, { name: region.name });
    return region;
  }

  async assignRegionLocations(tenant: TenantContext, regionId: string, dto: AssignRegionLocationsDto, user?: AuthenticatedUser) {
    const region = await this.requireRegion(tenant.tenantId, regionId);
    const locations = await this.locations.find({ where: { tenantId: tenant.tenantId, id: In(dto.locationIds) } });
    if (locations.length !== dto.locationIds.length) throw new BadRequestException('One or more locations are invalid');
    for (const location of locations) {
      location.regionId = region.id;
    }
    await this.locations.save(locations);
    await this.audit(tenant, user, 'enterprise.region.locations_assigned', region.id, { locationIds: dto.locationIds });
    return this.hierarchy(tenant, user);
  }

  async assignAccess(tenant: TenantContext, dto: AssignEnterpriseAccessDto, user?: AuthenticatedUser) {
    await this.requireUser(tenant.tenantId, dto.userId);
    this.assertScopePayload(dto.scopeType, dto);
    if (dto.organizationId) await this.requireOrganization(tenant.tenantId, dto.organizationId);
    if (dto.regionId) await this.requireRegion(tenant.tenantId, dto.regionId);
    if (dto.locationId) await this.requireLocation(tenant.tenantId, dto.locationId);

    const assignment = await this.accessAssignments.save(this.accessAssignments.create({
      tenantId: tenant.tenantId,
      userId: dto.userId,
      roleId: dto.roleId ?? null,
      scopeType: dto.scopeType,
      organizationId: dto.organizationId ?? null,
      regionId: dto.regionId ?? null,
      locationId: dto.locationId ?? null,
      staffRole: dto.staffRole ?? this.defaultStaffRole(dto.scopeType),
      metadata: {},
    }));

    if (dto.scopeType === 'location' && dto.locationId) {
      const existing = await this.userLocations.findOne({ where: { tenantId: tenant.tenantId, userId: dto.userId, locationId: dto.locationId } });
      if (!existing) {
        await this.userLocations.save(this.userLocations.create({ tenantId: tenant.tenantId, userId: dto.userId, locationId: dto.locationId }));
      }
    }

    await this.audit(tenant, user, 'enterprise.access.assigned', assignment.id, {
      targetUserId: dto.userId,
      scopeType: dto.scopeType,
      regionId: dto.regionId,
      locationId: dto.locationId,
      staffRole: assignment.staffRole,
    });
    return assignment;
  }

  async dashboard(tenant: TenantContext, user?: AuthenticatedUser, scopeType?: EnterpriseScopeType, scopeId?: string) {
    const organization = await this.ensureOrganization(tenant);
    const locationIds = await this.resolveDashboardLocationIds(tenant.tenantId, user, scopeType, scopeId);
    const [sales, inventory, delivery, staffCount, regionComparisons, locationPerformance] = await Promise.all([
      this.salesSummary(tenant.tenantId, locationIds),
      this.inventorySummary(tenant.tenantId, locationIds),
      this.deliverySummary(tenant.tenantId, locationIds),
      this.staffCount(tenant.tenantId, locationIds),
      this.regionComparisons(tenant.tenantId, locationIds),
      this.locationPerformance(tenant.tenantId, locationIds),
    ]);
    await this.audit(tenant, user, 'enterprise.dashboard.viewed', organization.id, { scopeType, scopeId, locations: locationIds.length });
    return {
      organizationId: organization.id,
      scope: { scopeType: scopeType ?? 'organization', scopeId: scopeId ?? organization.id, locationIds },
      sales,
      inventory,
      delivery,
      staff: { staffCount },
      regionComparisons,
      topLocations: [...locationPerformance].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      bottomLocations: [...locationPerformance].sort((a, b) => a.revenue - b.revenue).slice(0, 5),
      locationPerformance,
    };
  }

  async ssoPolicy(tenant: TenantContext, id: string, dto: UpdateEnterpriseSettingsDto, user?: AuthenticatedUser) {
    const saved = await this.updateSettings(tenant, id, { ssoPolicy: dto.ssoPolicy ?? {} }, user);
    await this.audit(tenant, user, 'enterprise.sso_policy.updated', id, { phase: 'saml_oauth_phase_1' });
    return saved.ssoPolicy;
  }

  private async ensureOrganization(tenant: TenantContext): Promise<EnterpriseOrganizationEntity> {
    const existing = await this.organizations.findOne({ where: { tenantId: tenant.tenantId }, order: { createdAt: 'ASC' } });
    if (existing) return existing;
    const tenantRow = await this.tenants.findOne({ where: { id: tenant.tenantId } });
    return this.createOrganization(tenant, { name: tenantRow?.name ?? 'Enterprise Organization' });
  }

  private async requireOrganization(tenantId: string, id: string): Promise<EnterpriseOrganizationEntity> {
    const organization = await this.organizations.findOne({ where: { id, tenantId } });
    if (!organization) throw new NotFoundException('Enterprise organization not found');
    return organization;
  }

  private async requireRegion(tenantId: string, id: string): Promise<EnterpriseRegionEntity> {
    const region = await this.regions.findOne({ where: { id, tenantId } });
    if (!region) throw new NotFoundException('Enterprise region not found');
    return region;
  }

  private async requireLocation(tenantId: string, id: string): Promise<LocationEntity> {
    const location = await this.locations.findOne({ where: { id, tenantId } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  private async requireUser(tenantId: string, id: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private assertScopePayload(scopeType: EnterpriseScopeType, dto: AssignEnterpriseAccessDto): void {
    if (scopeType === 'organization' && !dto.organizationId) throw new BadRequestException('organizationId is required');
    if (scopeType === 'region' && !dto.regionId) throw new BadRequestException('regionId is required');
    if (scopeType === 'location' && !dto.locationId) throw new BadRequestException('locationId is required');
  }

  private async resolveDashboardLocationIds(tenantId: string, user?: AuthenticatedUser, scopeType?: EnterpriseScopeType, scopeId?: string): Promise<string[]> {
    const allowed = await this.resolveAllowedLocationIds(tenantId, user);
    const query = this.locations.createQueryBuilder('location').where('location.tenant_id = :tenantId', { tenantId });
    if (scopeType === 'region' && scopeId) query.andWhere('location.region_id = :scopeId', { scopeId });
    if (scopeType === 'location' && scopeId) query.andWhere('location.id = :scopeId', { scopeId });
    const locations = await query.getMany();
    const ids = locations.map((location) => location.id);
    return allowed ? ids.filter((id) => allowed.includes(id)) : ids;
  }

  private async resolveAllowedLocationIds(tenantId: string, user?: AuthenticatedUser): Promise<string[] | null> {
    if (!user || user.roleName === 'owner' || user.roleName === 'admin' || user.permissions.includes('*')) return null;
    const explicit = new Set(user.locationIds ?? []);
    const assignments = await this.accessAssignments.find({ where: { tenantId, userId: user.id } });
    if (assignments.some((assignment) => assignment.scopeType === 'organization')) return null;
    const regionIds = assignments.map((assignment) => assignment.regionId).filter((id): id is string => Boolean(id));
    if (regionIds.length) {
      const regionLocations = await this.locations.find({ where: { tenantId, regionId: In(regionIds) } });
      for (const location of regionLocations) explicit.add(location.id);
    }
    for (const assignment of assignments) {
      if (assignment.locationId) explicit.add(assignment.locationId);
    }
    return explicit.size ? [...explicit] : [];
  }

  private async salesSummary(tenantId: string, locationIds: string[]) {
    const row = await this.orders
      .createQueryBuilder('order')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .andWhere(locationIds.length ? 'order.location_id IN (:...locationIds)' : '1 = 0', { locationIds })
      .getRawOne<{ orders: string; revenue: string }>();
    const orders = Number(row?.orders ?? 0);
    const revenue = Number(row?.revenue ?? 0);
    return { orders, revenue, averageOrderValue: orders ? revenue / orders : 0 };
  }

  private async inventorySummary(tenantId: string, locationIds: string[]) {
    const rows = await this.stockItems.find({ where: { tenantId, locationId: In(locationIds) } });
    const lowStock = rows.filter((item) => item.reorderLevel !== null && Number(item.quantityOnHand) <= Number(item.reorderLevel)).length;
    const outOfStock = rows.filter((item) => Number(item.quantityOnHand) <= 0).length;
    return { totalItems: rows.length, lowStock, outOfStock };
  }

  private async deliverySummary(tenantId: string, locationIds: string[]) {
    if (!locationIds.length) return { totalDeliveries: 0, delivered: 0, failed: 0, completionRate: 0 };
    const rows = await this.deliveries
      .createQueryBuilder('delivery')
      .innerJoin(OrderEntity, 'order', 'order.id = delivery.order_id')
      .select('delivery.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('delivery.tenant_id = :tenantId', { tenantId })
      .andWhere('order.location_id IN (:...locationIds)', { locationIds })
      .groupBy('delivery.status')
      .getRawMany<{ status: string; count: string }>();
    const totalDeliveries = rows.reduce((sum, row) => sum + Number(row.count), 0);
    const delivered = Number(rows.find((row) => row.status === DeliveryTaskStatus.DELIVERED)?.count ?? 0);
    const failed = Number(rows.find((row) => row.status === DeliveryTaskStatus.FAILED)?.count ?? 0);
    return { totalDeliveries, delivered, failed, completionRate: totalDeliveries ? delivered / totalDeliveries : 0 };
  }

  private async staffCount(tenantId: string, locationIds: string[]): Promise<number> {
    if (!locationIds.length) return 0;
    return this.userLocations.count({ where: { tenantId, locationId: In(locationIds) } });
  }

  private async regionComparisons(tenantId: string, locationIds: string[]) {
    if (!locationIds.length) return [];
    const rows = await this.orders
      .createQueryBuilder('order')
      .innerJoin(LocationEntity, 'location', 'location.id = order.location_id')
      .leftJoin(EnterpriseRegionEntity, 'region', 'region.id = location.region_id')
      .select('location.region_id', 'regionId')
      .addSelect("COALESCE(region.name, 'Unassigned')", 'regionName')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.location_id IN (:...locationIds)', { locationIds })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .groupBy('location.region_id')
      .addGroupBy('region.name')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ regionId: string | null; regionName: string; orders: string; revenue: string }>();
    return rows.map((row) => ({ ...row, orders: Number(row.orders), revenue: Number(row.revenue) }));
  }

  private async locationPerformance(tenantId: string, locationIds: string[]) {
    if (!locationIds.length) return [];
    const rows = await this.orders
      .createQueryBuilder('order')
      .innerJoin(LocationEntity, 'location', 'location.id = order.location_id')
      .select('location.id', 'locationId')
      .addSelect('location.name', 'locationName')
      .addSelect('location.region_id', 'regionId')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.tenant_id = :tenantId', { tenantId })
      .andWhere('order.location_id IN (:...locationIds)', { locationIds })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .groupBy('location.id')
      .addGroupBy('location.name')
      .addGroupBy('location.region_id')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ locationId: string; locationName: string; regionId: string | null; orders: string; revenue: string }>();
    return rows.map((row) => ({ ...row, orders: Number(row.orders), revenue: Number(row.revenue) }));
  }

  private permissionMatrix() {
    return [
      { role: 'enterprise_admin', scope: 'organization', permissions: ['*'] },
      { role: 'regional_manager', scope: 'region', permissions: ['enterprise.read', 'enterprise.dashboard', 'locations.read', 'reports:read', 'staff.read'] },
      { role: 'location_manager', scope: 'location', permissions: ['enterprise.read', 'locations.read', 'inventory.read', 'orders.read', 'staff.read'] },
      { role: 'pos_staff', scope: 'location', permissions: ['pos:access', 'orders:create', 'orders.read'] },
      { role: 'picker', scope: 'location', permissions: ['fulfillment.read', 'fulfillment.write', 'inventory.read'] },
      { role: 'driver', scope: 'location', permissions: ['deliveries:read', 'deliveries:update'] },
      { role: 'support', scope: 'location', permissions: ['support.read', 'support.write'] },
    ];
  }

  private defaultStaffRole(scopeType: EnterpriseScopeType): string {
    if (scopeType === 'organization') return 'enterprise_admin';
    if (scopeType === 'region') return 'regional_manager';
    return 'location_manager';
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, entityId: string, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType: 'enterprise',
      entityId,
      source: 'admin_ui',
      riskLevel: action.includes('settings') || action.includes('access') ? 'high' : 'medium',
      metadata,
    });
  }

  private slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'enterprise';
  }
}
