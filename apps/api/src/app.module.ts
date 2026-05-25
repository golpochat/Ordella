import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformModule } from './platform/platform.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { PosModule } from './modules/pos/pos.module';
import { OnlineModule } from './modules/online/online.module';
import { KdsModule } from './modules/kds/kds.module';
import { AdminModule } from './modules/admin/admin.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { BillingModule } from './modules/billing/billing.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { GiftCardsModule } from './modules/giftcards/giftcards.module';
import { CustomerAccountsModule } from './modules/customer-accounts';
import { AuditModule } from './modules/audit';
import { MarketingModule } from './modules/marketing';
import { CrmModule } from './modules/crm';
import { SubscriptionsModule } from './modules/subscriptions';
import { BundlesModule } from './modules/bundles';
import { ThemesModule } from './modules/themes';
import { RecommendationsModule } from './modules/recommendations';
import { HqModule } from './modules/hq';
import { ProcurementModule } from './modules/procurement';
import { WarehouseModule } from './modules/warehouse';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
      }),
    }),
    AuthModule,
    TenantsModule,
    CatalogModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    DeliveriesModule,
    NotificationsModule,
    IntegrationsModule,
    ReportsModule,
    PromotionsModule,
    MarketingModule,
    CrmModule,
    SubscriptionsModule,
    BundlesModule,
    ThemesModule,
    RecommendationsModule,
    HqModule,
    ProcurementModule,
    WarehouseModule,
    AuditModule,
    CustomerAccountsModule,
    LoyaltyModule,
    GiftCardsModule,
    PosModule,
    OnlineModule,
    KdsModule,
    AdminModule,
    OnboardingModule,
    BillingModule,
    PlatformModule,
  ],
})
export class AppModule {}
