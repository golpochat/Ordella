import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext } from '../../../common/interfaces';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';
import { CreateBundleDto, UpdateBundleDto } from '../dto';
import { BundleEntity, BundleItemEntity } from '../entities';

@Injectable()
export class BundlesService {
  constructor(
    @InjectRepository(BundleEntity)
    private readonly bundles: Repository<BundleEntity>,
    @InjectRepository(BundleItemEntity)
    private readonly bundleItems: Repository<BundleItemEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItems: Repository<OrderItemEntity>,
  ) {}

  list(tenant: TenantContext, locationId?: string): Promise<BundleEntity[]> {
    return this.bundles.find({
      where: {
        tenantId: tenant.tenantId,
        ...(locationId ? { locationId } : {}),
      },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async get(tenant: TenantContext, id: string): Promise<BundleEntity> {
    const bundle = await this.bundles.findOne({
      where: { tenantId: tenant.tenantId, id },
      relations: { items: true },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return bundle;
  }

  async create(tenant: TenantContext, dto: CreateBundleDto): Promise<BundleEntity> {
    const bundle = await this.bundles.save(this.bundles.create({
      tenantId: tenant.tenantId,
      locationId: dto.locationId ?? null,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      priceType: dto.priceType,
      fixedPrice: dto.fixedPrice !== undefined ? dto.fixedPrice.toFixed(2) : null,
      discountAmount: dto.discountAmount !== undefined ? dto.discountAmount.toFixed(2) : null,
      discountPercent: dto.discountPercent !== undefined ? dto.discountPercent.toFixed(2) : null,
      isActive: dto.isActive ?? true,
    }));
    await this.replaceItems(bundle.id, dto.items);
    return this.get(tenant, bundle.id);
  }

  async update(tenant: TenantContext, dto: UpdateBundleDto): Promise<BundleEntity> {
    const bundle = await this.get(tenant, dto.id);
    bundle.locationId = dto.locationId ?? null;
    bundle.name = dto.name.trim();
    bundle.description = dto.description?.trim() || null;
    bundle.priceType = dto.priceType;
    bundle.fixedPrice = dto.fixedPrice !== undefined ? dto.fixedPrice.toFixed(2) : null;
    bundle.discountAmount = dto.discountAmount !== undefined ? dto.discountAmount.toFixed(2) : null;
    bundle.discountPercent = dto.discountPercent !== undefined ? dto.discountPercent.toFixed(2) : null;
    bundle.isActive = dto.isActive ?? bundle.isActive;
    await this.bundles.save(bundle);
    await this.replaceItems(bundle.id, dto.items);
    return this.get(tenant, bundle.id);
  }

  async duplicate(tenant: TenantContext, id: string): Promise<BundleEntity> {
    const bundle = await this.get(tenant, id);
    return this.create(tenant, {
      locationId: bundle.locationId ?? undefined,
      name: `${bundle.name} copy`,
      description: bundle.description ?? undefined,
      priceType: bundle.priceType,
      fixedPrice: bundle.fixedPrice ? Number(bundle.fixedPrice) : undefined,
      discountAmount: bundle.discountAmount ? Number(bundle.discountAmount) : undefined,
      discountPercent: bundle.discountPercent ? Number(bundle.discountPercent) : undefined,
      isActive: false,
      items: bundle.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        isOptional: item.isOptional,
        minSelect: item.minSelect ?? undefined,
        maxSelect: item.maxSelect ?? undefined,
      })),
    });
  }

  async disable(tenant: TenantContext, id: string): Promise<BundleEntity> {
    const bundle = await this.get(tenant, id);
    bundle.isActive = false;
    return this.bundles.save(bundle);
  }

  async delete(tenant: TenantContext, id: string): Promise<void> {
    await this.get(tenant, id);
    await this.bundles.delete({ tenantId: tenant.tenantId, id });
  }

  async analytics(tenant: TenantContext) {
    const bundles = await this.list(tenant);
    const rows = await this.orderItems
      .createQueryBuilder('item')
      .select('item.bundleId', 'bundleId')
      .addSelect('SUM(item.price * item.quantity)', 'revenue')
      .addSelect('COUNT(DISTINCT item.orderId)', 'orders')
      .innerJoin('item.order', 'order')
      .where('item.bundleId IS NOT NULL')
      .andWhere('order.tenantId = :tenantId', { tenantId: tenant.tenantId })
      .groupBy('item.bundleId')
      .getRawMany<{ bundleId: string; revenue: string; orders: string }>();
    const byBundle = new Map(rows.map((row) => [row.bundleId, row]));
    const bundleSales = rows.reduce((sum, row) => sum + Number(row.orders ?? 0), 0);
    const revenue = rows.reduce((sum, row) => sum + Number(row.revenue ?? 0), 0);
    return {
      bundleSales,
      bundleConversionRate: 0,
      averageBundleValue: bundleSales > 0 ? (revenue / bundleSales).toFixed(2) : '0.00',
      bundleImpactOnAov: '0.00',
      topPerformingBundles: bundles
        .map((bundle) => ({
          id: bundle.id,
          name: bundle.name,
          sales: Number(byBundle.get(bundle.id)?.orders ?? 0),
          revenue: Number(byBundle.get(bundle.id)?.revenue ?? 0).toFixed(2),
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10),
    };
  }

  private async replaceItems(bundleId: string, items: CreateBundleDto['items']): Promise<void> {
    await this.bundleItems.delete({ bundleId });
    await this.bundleItems.save(items.map((item) => this.bundleItems.create({
      bundleId,
      itemId: item.itemId,
      quantity: item.quantity,
      isOptional: item.isOptional ?? false,
      minSelect: item.minSelect ?? null,
      maxSelect: item.maxSelect ?? null,
    })));
  }
}
