import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { AuditLogService } from '../../audit/services';
import { UserEntity } from '../../auth/entities';
import { CustomerEntity } from '../../loyalty/entities';
import { OrderEntity, OrderItemEntity } from '../../orders/entities';
import { OrderStatus } from '../../orders/enums/order-status.enum';
import { ProductEntity, CategoryEntity } from '../../catalog/entities';
import { StockItemEntity } from '../../inventory/entities';
import { availableQty } from '../../inventory/domain/stock-quantity.util';
import { LocationEntity, TenantEntity, FranchiseGroupEntity } from '../../tenants/entities';
import { TenantStatus } from '../../tenants/enums/tenant-status.enum';
import { TenantSignupService } from '../../onboarding/services/tenant-signup.service';
import { CreateFranchiseeDto, HqQueryDto } from '../dto';

const EXCLUDED_ORDER_STATUSES = [OrderStatus.CANCELLED, OrderStatus.FAILED];

@Injectable()
export class HqService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(FranchiseGroupEntity)
    private readonly franchiseGroups: Repository<FranchiseGroupEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(StockItemEntity)
    private readonly stockItems: Repository<StockItemEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly tenantSignup: TenantSignupService,
    private readonly auditLogs: AuditLogService,
  ) {}

  async overview(tenant: TenantContext, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_overview', { tenantIds: scope.tenantIds });

    const [sales, customerCount, activeLocations, inventoryIssues, staffCount, locationRows] = await Promise.all([
      this.aggregateSales(scope.tenantIds),
      this.customers.count({ where: { tenantId: In(scope.tenantIds) } }),
      this.locations.count({ where: { tenantId: In(scope.tenantIds) } }),
      this.inventoryIssues(scope.tenantIds),
      this.users.count({ where: { tenantId: In(scope.tenantIds) } }),
      this.locationPerformance(scope.tenantIds),
    ]);

    const topPerformingLocations = [...locationRows].sort((a, b) => Number(b.revenue) - Number(a.revenue)).slice(0, 5);
    const underperformingLocations = [...locationRows].sort((a, b) => Number(a.revenue) - Number(b.revenue)).slice(0, 5);
    const failedPayments = await this.orders.count({
      where: { tenantId: In(scope.tenantIds), paymentStatus: 'failed' as never },
    });

    return {
      scope,
      totalRevenue: sales.revenue,
      totalOrders: sales.orders,
      averageOrderValue: sales.orders ? (Number(sales.revenue) / sales.orders).toFixed(2) : '0.00',
      totalCustomers: customerCount,
      activeLocations,
      topPerformingLocations,
      underperformingLocations,
      alerts: {
        lowStock: inventoryIssues.filter((item) => item.status === 'low').length,
        outOfStock: inventoryIssues.filter((item) => item.status === 'out_of_stock').length,
        failedPayments,
        offlinePos: 0,
      },
    };
  }

  async locationsView(tenant: TenantContext, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_locations', { tenantIds: scope.tenantIds });
    return this.locationPerformance(scope.tenantIds);
  }

  async categories(tenant: TenantContext, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_categories', { tenantIds: scope.tenantIds });
    const rows = await this.orderItems
      .createQueryBuilder('item')
      .innerJoin(OrderEntity, 'order', 'order.id = item.order_id')
      .leftJoin(ProductEntity, 'product', 'product.id = item.product_id')
      .leftJoin(CategoryEntity, 'category', 'category.id = product.category_id')
      .leftJoin(LocationEntity, 'location', 'location.id = order.location_id')
      .select('order.location_id', 'locationId')
      .addSelect("COALESCE(location.name, 'Unknown location')", 'locationName')
      .addSelect('product.category_id', 'categoryId')
      .addSelect("COALESCE(category.name, 'Uncategorized')", 'categoryName')
      .addSelect('SUM(item.quantity)', 'quantitySold')
      .addSelect('COALESCE(SUM(item.quantity * item.price), 0)', 'revenue')
      .where('order.tenant_id IN (:...tenantIds)', { tenantIds: scope.tenantIds })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .groupBy('order.location_id')
      .addGroupBy('location.name')
      .addGroupBy('product.category_id')
      .addGroupBy('category.name')
      .orderBy('revenue', 'DESC')
      .limit(100)
      .getRawMany<{ locationId: string; locationName: string; categoryId: string | null; categoryName: string; quantitySold: string; revenue: string }>();

    return rows.map((row) => ({
      ...row,
      quantitySold: Number(row.quantitySold),
      revenue: Number(row.revenue).toFixed(2),
    }));
  }

  async customersView(tenant: TenantContext, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_customers', { tenantIds: scope.tenantIds });
    const rows = await this.customers
      .createQueryBuilder('customer')
      .leftJoin(TenantEntity, 'tenant', 'tenant.id = customer.tenant_id')
      .select('customer.tenant_id', 'tenantId')
      .addSelect("COALESCE(tenant.name, 'Franchisee')", 'tenantName')
      .addSelect('COUNT(*)', 'customers')
      .addSelect('COALESCE(SUM(customer.lifetime_value), 0)', 'lifetimeValue')
      .addSelect('COALESCE(AVG(customer.avg_order_value), 0)', 'avgOrderValue')
      .where('customer.tenant_id IN (:...tenantIds)', { tenantIds: scope.tenantIds })
      .groupBy('customer.tenant_id')
      .addGroupBy('tenant.name')
      .orderBy('lifetimeValue', 'DESC')
      .getRawMany<{ tenantId: string; tenantName: string; customers: string; lifetimeValue: string; avgOrderValue: string }>();
    return rows.map((row) => ({
      tenantId: row.tenantId,
      tenantName: row.tenantName,
      customers: Number(row.customers),
      lifetimeValue: Number(row.lifetimeValue).toFixed(2),
      avgOrderValue: Number(row.avgOrderValue).toFixed(2),
    }));
  }

  async ordersView(tenant: TenantContext, query: HqQueryDto, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_orders', { tenantIds: scope.tenantIds, filters: query });
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const qb = this.orders
      .createQueryBuilder('order')
      .leftJoin(LocationEntity, 'location', 'location.id = order.location_id')
      .leftJoin(TenantEntity, 'tenant', 'tenant.id = order.tenant_id')
      .where('order.tenant_id IN (:...tenantIds)', { tenantIds: scope.tenantIds })
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (query.locationId) qb.andWhere('order.location_id = :locationId', { locationId: query.locationId });
    if (query.status) qb.andWhere('order.status = :status', { status: query.status });
    if (query.channel) qb.andWhere('order.order_type = :channel', { channel: query.channel });
    if (query.from && query.to) qb.andWhere('order.created_at BETWEEN :from AND :to', { from: new Date(query.from), to: new Date(query.to) });
    const countQb = qb.clone();

    const rows = await qb
      .select([
        'order.id AS id',
        'order.order_number AS "orderNumber"',
        'order.tenant_id AS "tenantId"',
        "COALESCE(tenant.name, 'Franchisee') AS \"tenantName\"",
        'order.location_id AS "locationId"',
        "COALESCE(location.name, 'Unknown location') AS \"locationName\"",
        'order.order_type AS "orderType"',
        'order.status AS status',
        'order.payment_status AS "paymentStatus"',
        'order.total AS total',
        'order.created_at AS "createdAt"',
      ])
      .getRawMany<Record<string, unknown>>();
    const total = await countQb.getCount();

    return { rows, page, limit, total };
  }

  async inventoryView(tenant: TenantContext, query: HqQueryDto, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_inventory', { tenantIds: scope.tenantIds, filters: query });
    const rows = await this.inventoryIssues(scope.tenantIds, query.locationId, query.limit ?? 100);
    return rows;
  }

  async staffView(tenant: TenantContext, query: HqQueryDto, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    await this.audit(tenant, user, 'hq.view_staff', { tenantIds: scope.tenantIds, filters: query });
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const [users, total] = await this.users.findAndCount({
      where: { tenantId: In(scope.tenantIds) },
      relations: ['role'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      rows: users.map((user) => ({
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role?.name ?? 'Staff',
        status: user.status,
      })),
      page,
      limit,
      total,
    };
  }

  async createFranchisee(tenant: TenantContext, dto: CreateFranchiseeDto, user?: AuthenticatedUser) {
    const scope = await this.resolveScope(tenant.tenantId);
    if (scope.currentTenant.tenantType === 'franchisee') {
      throw new ForbiddenException('Franchisee tenants cannot create franchisees');
    }
    const result = await this.tenantSignup.createTenant(dto.name, dto.email, dto.password);
    await this.tenants.update(result.tenantId, {
      parentTenantId: tenant.tenantId,
      tenantType: 'franchisee',
    });
    await this.tenants.update(tenant.tenantId, { tenantType: 'hq' });
    const group = await this.ensureGroup(tenant.tenantId, scope.currentTenant.name);
    group.franchiseeTenantIds = [...new Set([...group.franchiseeTenantIds, result.tenantId])];
    await this.franchiseGroups.save(group);
    await this.audit(tenant, user, 'hq.create_franchisee', { franchiseeTenantId: result.tenantId, name: dto.name });
    return {
      tenantId: result.tenantId,
      tenantName: result.tenantName,
      slug: result.slug,
      email: result.email,
    };
  }

  private async resolveScope(hqTenantId: string) {
    const currentTenant = await this.tenants.findOne({ where: { id: hqTenantId } });
    if (!currentTenant) throw new ForbiddenException('Tenant context is invalid');
    const [group, childTenants] = await Promise.all([
      this.franchiseGroups.findOne({ where: { hqTenantId } }),
      this.tenants.find({ where: { parentTenantId: hqTenantId } }),
    ]);
    const tenantIds = [
      hqTenantId,
      ...(group?.franchiseeTenantIds ?? []),
      ...childTenants.map((tenant) => tenant.id),
    ];
    return {
      currentTenant,
      tenantIds: [...new Set(tenantIds)],
      franchiseeTenantIds: [...new Set([...(group?.franchiseeTenantIds ?? []), ...childTenants.map((tenant) => tenant.id)])],
    };
  }

  private async ensureGroup(hqTenantId: string, hqName: string) {
    const existing = await this.franchiseGroups.findOne({ where: { hqTenantId } });
    if (existing) return existing;
    return this.franchiseGroups.save(
      this.franchiseGroups.create({
        hqTenantId,
        name: `${hqName} Franchise Group`,
        franchiseeTenantIds: [],
      }),
    );
  }

  private async aggregateSales(tenantIds: string[]) {
    const row = await this.orders
      .createQueryBuilder('order')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.tenant_id IN (:...tenantIds)', { tenantIds })
      .andWhere('order.status NOT IN (:...excluded)', { excluded: EXCLUDED_ORDER_STATUSES })
      .getRawOne<{ orders: string; revenue: string }>();
    return {
      orders: Number(row?.orders ?? 0),
      revenue: Number(row?.revenue ?? 0).toFixed(2),
    };
  }

  private async locationPerformance(tenantIds: string[]) {
    const rows = await this.locations
      .createQueryBuilder('location')
      .leftJoin(TenantEntity, 'tenant', 'tenant.id = location.tenant_id')
      .leftJoin(OrderEntity, 'order', 'order.location_id = location.id AND order.status NOT IN (:...excluded)', {
        excluded: EXCLUDED_ORDER_STATUSES,
      })
      .select('location.id', 'locationId')
      .addSelect('location.tenant_id', 'tenantId')
      .addSelect('location.name', 'locationName')
      .addSelect('location.status', 'status')
      .addSelect("COALESCE(tenant.name, 'Franchisee')", 'tenantName')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('location.tenant_id IN (:...tenantIds)', { tenantIds })
      .groupBy('location.id')
      .addGroupBy('location.tenant_id')
      .addGroupBy('location.name')
      .addGroupBy('location.status')
      .addGroupBy('tenant.name')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ locationId: string; tenantId: string; tenantName: string; locationName: string; status: string; orders: string; revenue: string }>();

    return rows.map((row) => {
      const orders = Number(row.orders);
      const revenue = Number(row.revenue);
      return {
        ...row,
        orders,
        revenue: revenue.toFixed(2),
        averageOrderValue: orders ? (revenue / orders).toFixed(2) : '0.00',
      };
    });
  }

  private async inventoryIssues(tenantIds: string[], locationId?: string, limit = 100) {
    const qb = this.stockItems
      .createQueryBuilder('stock')
      .leftJoin(LocationEntity, 'location', 'location.id = stock.location_id')
      .leftJoin(TenantEntity, 'tenant', 'tenant.id = stock.tenant_id')
      .where('stock.tenant_id IN (:...tenantIds)', { tenantIds })
      .andWhere('(stock.quantity_on_hand <= 0 OR stock.quantity_on_hand <= COALESCE(stock.reorder_level, :defaultReorder))', {
        defaultReorder: '5',
      })
      .orderBy('stock.quantity_on_hand', 'ASC')
      .limit(limit);
    if (locationId) qb.andWhere('stock.location_id = :locationId', { locationId });
    const rows = await qb
      .select([
        'stock.id AS id',
        'stock.tenant_id AS "tenantId"',
        "COALESCE(tenant.name, 'Franchisee') AS \"tenantName\"",
        'stock.location_id AS "locationId"',
        "COALESCE(location.name, 'Unknown location') AS \"locationName\"",
        'stock.product_id AS "productId"',
        'stock.name AS name',
        'stock.sku AS sku',
        'stock.quantity_on_hand AS "quantityOnHand"',
        'stock.quantity_reserved AS "quantityReserved"',
        'stock.reorder_level AS "reorderLevel"',
      ])
      .getRawMany<Record<string, string | null>>();
    return rows.map((row) => {
      const available = availableQty(String(row.quantityOnHand ?? '0'), String(row.quantityReserved ?? '0'));
      return {
        ...row,
        quantityAvailable: available.toFixed(4),
        status: Number(row.quantityOnHand ?? 0) <= 0 ? 'out_of_stock' : 'low',
      };
    });
  }

  private async audit(tenant: TenantContext, user: AuthenticatedUser | undefined, action: string, metadata: Record<string, unknown>) {
    await this.auditLogs.record({
      tenantId: tenant.tenantId,
      userId: user?.id ?? null,
      action,
      entityType: 'franchise_hq',
      entityId: tenant.tenantId,
      metadata,
    });
  }
}
