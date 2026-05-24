import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantBillingEntity } from '../../onboarding/entities/tenant-billing.entity';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

@Injectable()
export class BillingRepository {
  constructor(
    @InjectRepository(TenantBillingEntity)
    private readonly billing: Repository<TenantBillingEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(OrderEntity)
    private readonly orders: Repository<OrderEntity>,
  ) {}

  findBilling(tenantId: string): Promise<TenantBillingEntity | null> {
    return this.billing.findOne({ where: { tenantId } });
  }

  findBillingByStripeCustomer(customerId: string): Promise<TenantBillingEntity | null> {
    return this.billing.findOne({ where: { stripeCustomerId: customerId } });
  }

  findBillingByStripeSubscription(subscriptionId: string): Promise<TenantBillingEntity | null> {
    return this.billing.findOne({ where: { stripeSubscriptionId: subscriptionId } });
  }

  saveBilling(entity: Partial<TenantBillingEntity>): Promise<TenantBillingEntity> {
    return this.billing.save(entity);
  }

  findTenant(tenantId: string): Promise<TenantEntity | null> {
    return this.tenants.findOne({ where: { id: tenantId } });
  }

  async countLocations(tenantId: string): Promise<number> {
    return this.locations.count({ where: { tenantId } });
  }

  async countOrdersInPeriod(tenantId: string, periodStart: Date): Promise<number> {
    return this.orders
      .createQueryBuilder('o')
      .where('o.tenant_id = :tenantId', { tenantId })
      .andWhere('o.created_at >= :periodStart', { periodStart })
      .getCount();
  }
}
