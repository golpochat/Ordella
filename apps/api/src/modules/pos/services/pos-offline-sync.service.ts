import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContext, AuthenticatedUser } from '../../../common/interfaces';
import { resolveRolePermissions } from '../../../common/rbac/role-permissions';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { UserEntity } from '../../auth/entities/user.entity';
import { ProductEntity } from '../../catalog/entities/product.entity';
import { ProductStatus } from '../../catalog/enums/product-status.enum';
import { LoyaltyService } from '../../loyalty/services';
import { OrderPaymentMethod } from '../../orders/enums/order-payment-method.enum';
import { OrdersService } from '../../orders/services/orders.service';
import { NotificationsService } from '../../notifications/services';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { TenantSettingsService } from '../../admin/services/tenant-settings.service';
import {
  PosOfflineOrderDto,
  PosOfflineSyncInventoryDto,
  PosOfflineSyncOrdersDto,
} from '../dto';
import { PosOfflineOrderSyncEntity, PosOfflineOrderSyncStatus } from '../entities';
import { PosCatalogService } from './pos-catalog.service';

type OfflineSettings = {
  enabled: boolean;
  allowOfflineCardPayments: boolean;
  allowOutOfStockOfflineSales: boolean;
  allowUnknownStockOfflineSales: boolean;
  maxOfflineDurationMinutes: number;
  autoSyncIntervalSeconds: number;
};

const DEFAULT_OFFLINE_SETTINGS: OfflineSettings = {
  enabled: true,
  allowOfflineCardPayments: false,
  allowOutOfStockOfflineSales: false,
  allowUnknownStockOfflineSales: true,
  maxOfflineDurationMinutes: 720,
  autoSyncIntervalSeconds: 30,
};

@Injectable()
export class PosOfflineSyncService {
  private readonly logger = new Logger(PosOfflineSyncService.name);

  constructor(
    private readonly catalogService: PosCatalogService,
    private readonly ordersService: OrdersService,
    private readonly loyaltyService: LoyaltyService,
    private readonly tenantSettingsService: TenantSettingsService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(PosOfflineOrderSyncEntity)
    private readonly syncRepository: Repository<PosOfflineOrderSyncEntity>,
    @InjectRepository(ProductEntity)
    private readonly products: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async bootstrap(tenant: TenantContext, locationId?: string) {
    const [catalog, settingsRow, customers, staff] = await Promise.all([
      this.catalogService.getCatalog(tenant.tenantId, locationId),
      locationId ? this.tenantSettingsService.getSettings(tenant.tenantId, locationId) : null,
      this.loyaltyService.searchCustomers(tenant, {}),
      this.users.find({
        where: { tenantId: tenant.tenantId, status: UserStatus.ACTIVE },
        relations: { role: true },
        take: 100,
      }),
    ]);

    const items = catalog.items as Array<Record<string, unknown>>;
    const rawPosSettings =
      ((settingsRow?.settings as Record<string, unknown> | undefined)?.posSettings as
        | Record<string, unknown>
        | undefined) ?? {};
    const settings = this.normalizeSettings(rawPosSettings.offlineMode ?? rawPosSettings);

    return {
      categories: catalog.categories,
      items: catalog.items,
      taxes: [],
      discounts: [],
      bundles: items.filter((item) => item.itemType === 'bundle'),
      inventory: items
        .filter((item) => item.itemType !== 'bundle')
        .map((item) => ({
          productId: item.id,
          stockLevel: item.stockLevel ?? null,
          stockStatus: item.stockStatus ?? null,
          inventoryTrackingEnabled: Boolean(item.inventoryTrackingEnabled),
          updatedAt: new Date().toISOString(),
        })),
      customers: customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        pointsBalance: customer.pointsBalance,
        storeCreditBalance: customer.storeCreditBalance,
      })),
      staffPermissions: staff.map((member) => ({
        staffId: member.id,
        role: member.role?.name ?? null,
        permissions: resolveRolePermissions(member.role?.name ?? '', []),
      })),
      settings,
      syncedAt: new Date().toISOString(),
    };
  }

  async syncOrders(
    tenant: TenantContext,
    dto: PosOfflineSyncOrdersDto,
    user?: AuthenticatedUser,
  ) {
    const results = [];

    for (const order of dto.orders) {
      results.push(await this.syncOneOrder(tenant, order, user));
    }

    for (const event of dto.events ?? []) {
      await this.notify(tenant.tenantId, event.type, event.payload);
    }

    return { results, syncedAt: new Date().toISOString() };
  }

  async syncInventory(tenant: TenantContext, dto: PosOfflineSyncInventoryDto) {
    if (dto.adjustments.length) {
      this.logger.warn(
        `POS offline inventory adjustments queued tenant=${tenant.tenantId} location=${dto.locationId} count=${dto.adjustments.length}`,
      );
    }
    const bootstrap = await this.bootstrap(tenant, dto.locationId);
    return { syncedAt: bootstrap.syncedAt, inventory: bootstrap.inventory };
  }

  private async syncOneOrder(
    tenant: TenantContext,
    order: PosOfflineOrderDto,
    user?: AuthenticatedUser,
  ) {
    const existing = await this.syncRepository.findOne({
      where: { tenantId: tenant.tenantId, clientOrderId: order.clientOrderId },
    });
    if (existing && existing.status !== 'failed') {
      return {
        clientOrderId: order.clientOrderId,
        orderId: existing.orderId ?? undefined,
        status: existing.status === 'synced' ? 'synced' : 'requires_review',
        conflicts: existing.conflicts,
        message: existing.errorMessage ?? undefined,
      };
    }

    const conflicts = await this.findConflicts(tenant, order);
    const disabled = conflicts.includes('item_disabled');
    if (disabled) {
      const record = await this.saveSyncRecord(tenant, order, 'requires_review', conflicts, null, 'Item disabled');
      return {
        clientOrderId: order.clientOrderId,
        status: record.status,
        conflicts,
        message: record.errorMessage ?? undefined,
      };
    }

    try {
      const customerId = await this.resolveCustomerId(tenant, order);
      const paymentMethod = this.mapPaymentMethod(order.paymentMethod, conflicts);
      const created = await this.ordersService.create(
        tenant,
        {
          locationId: order.session.locationId,
          orderType: order.orderType,
          paymentMethod,
          customerId,
          loyaltyRedeemPoints: order.loyaltyRedeemPoints,
          giftCardCode: order.giftCardCode,
          giftCardAmount: order.giftCardAmount,
          storeCreditAmount: order.storeCreditAmount,
          couponCode: order.couponCode,
          discountPercent: order.discountPercent,
          discountFixed: order.discountFixed,
          items: order.lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            bundleId: line.bundleId,
            quantity: line.quantity,
            modifierOptionIds: line.modifierOptionIds,
            notes: line.notes,
            priceOverride: line.unitPrice,
          })),
        },
        user,
      );

      const status: PosOfflineOrderSyncStatus = conflicts.length ? 'requires_review' : 'synced';
      const record = await this.saveSyncRecord(tenant, order, status, conflicts, created.id, null);
      if (status === 'requires_review') {
        await this.notify(tenant.tenantId, 'pos_offline_sync_requires_review', {
          orderId: created.id,
          clientOrderId: order.clientOrderId,
          conflicts,
        });
      }
      return {
        clientOrderId: order.clientOrderId,
        orderId: created.id,
        status: record.status,
        conflicts,
        message: record.errorMessage ?? undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Offline order sync failed';
      const record = await this.saveSyncRecord(tenant, order, 'failed', conflicts, null, message);
      await this.notify(tenant.tenantId, 'pos_offline_sync_failed', {
        clientOrderId: order.clientOrderId,
        message,
      });
      return {
        clientOrderId: order.clientOrderId,
        status: record.status,
        conflicts,
        message,
      };
    }
  }

  private async findConflicts(tenant: TenantContext, order: PosOfflineOrderDto): Promise<string[]> {
    const conflicts = new Set<string>(order.flags);
    const products = await this.products.find({
      where: order.lines.map((line) => ({ tenantId: tenant.tenantId, id: line.productId })),
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    for (const line of order.lines) {
      const product = productById.get(line.productId);
      if (!product || product.status !== ProductStatus.ACTIVE) {
        conflicts.add('item_disabled');
        continue;
      }
      if (Number(product.price) !== line.unitPrice) {
        conflicts.add('price_changed');
      }
      if (
        product.inventoryTrackingEnabled &&
        product.stockLevel !== null &&
        product.stockLevel !== undefined &&
        product.stockLevel < line.quantity
      ) {
        conflicts.add('stock_insufficient');
      }
    }

    if (order.paymentMethod === 'card') conflicts.add('payment_requires_review');
    if (order.paymentMethod === 'external') conflicts.add('external_payment_requires_review');

    return [...conflicts];
  }

  private async resolveCustomerId(
    tenant: TenantContext,
    order: PosOfflineOrderDto,
  ): Promise<string | undefined> {
    if (order.customer?.customerId) return order.customer.customerId;
    if (!order.customer) return undefined;
    const customer = await this.loyaltyService.findOrCreateCustomer(
      tenant.tenantId,
      {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
      },
      true,
    );
    return customer?.id;
  }

  private mapPaymentMethod(
    method: PosOfflineOrderDto['paymentMethod'],
    conflicts: string[],
  ): OrderPaymentMethod | undefined {
    if (method === 'cash') return OrderPaymentMethod.CASH;
    if (method === 'pos') return OrderPaymentMethod.POS;
    conflicts.push(method === 'card' ? 'payment_requires_review' : 'external_payment_requires_review');
    return undefined;
  }

  private async saveSyncRecord(
    tenant: TenantContext,
    order: PosOfflineOrderDto,
    status: PosOfflineOrderSyncStatus,
    conflicts: string[],
    orderId: string | null,
    errorMessage: string | null,
  ): Promise<PosOfflineOrderSyncEntity> {
    const existing = await this.syncRepository.findOne({
      where: { tenantId: tenant.tenantId, clientOrderId: order.clientOrderId },
    });
    const record =
      existing ??
      this.syncRepository.create({
        tenantId: tenant.tenantId,
        locationId: order.session.locationId,
        clientOrderId: order.clientOrderId,
      });
    record.orderId = orderId;
    record.status = status;
    record.payload = order as unknown as Record<string, unknown>;
    record.conflicts = [...new Set(conflicts)];
    record.errorMessage = errorMessage;
    record.syncedAt = status === 'synced' || status === 'requires_review' ? new Date() : null;
    return this.syncRepository.save(record);
  }

  private normalizeSettings(value: unknown): OfflineSettings {
    const settings = (typeof value === 'object' && value ? value : {}) as Partial<OfflineSettings>;
    return {
      ...DEFAULT_OFFLINE_SETTINGS,
      ...settings,
      maxOfflineDurationMinutes:
        Number(settings.maxOfflineDurationMinutes) || DEFAULT_OFFLINE_SETTINGS.maxOfflineDurationMinutes,
      autoSyncIntervalSeconds:
        Number(settings.autoSyncIntervalSeconds) || DEFAULT_OFFLINE_SETTINGS.autoSyncIntervalSeconds,
    };
  }

  private async notify(
    tenantId: string,
    templateName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.notificationsService.sendSystemNotification(tenantId, {
      type: templateName.includes('payment') ? NotificationType.PAYMENT_ALERT : NotificationType.SYSTEM,
      channel: NotificationChannelType.PUSH,
      payload: {
        templateName,
        message: String(payload.message ?? templateName),
        ...payload,
      },
    });
  }
}
