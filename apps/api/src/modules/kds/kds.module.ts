import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderEntity } from '../orders/entities/order.entity';
import { ProductEntity } from '../catalog/entities/product.entity';
import { VariantEntity } from '../catalog/entities/variant.entity';
import { OrdersFeatureModule } from '../orders/modules/orders/orders-feature.module';
import { ReportsModule } from '../reports/reports.module';
import { KDS_ENTITIES, KdsOrderItemStateEntity } from './entities';
import { KdsController } from './controllers';
import { KdsGateway } from './gateways/kds.gateway';
import {
  KdsBroadcastService,
  KdsOrderQueryService,
  KdsUpdateService,
} from './services';
import { KdsCatalogLookupService } from './services/kds-catalog-lookup.service';
import { KdsOrderQueryRepository } from './repositories/kds-order-query.repository';
import { KdsOrderItemStateRepository } from './repositories/kds-order-item-state.repository';
import { KdsNotificationsIntegration, KdsReportingIntegration } from './integrations';

/**
 * Fulfillment Display System (FDS) — active order queue, line-item prep tracking, WebSocket updates.
 *
 * Routes (/api/v1, tenant-scoped):
 * - GET /kds/orders
 * - GET /kds/orders/:orderId
 * - POST /kds/orders/:orderId/preparing|ready
 * - POST /kds/orders/:orderId/items/:itemId/start|complete
 *
 * WebSocket namespace: `/kds` (subscribe via `kds.subscribe` + tenantId)
 */
@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([...KDS_ENTITIES, OrderEntity, ProductEntity, VariantEntity]),
    OrdersFeatureModule,
    ReportsModule,
  ],
  controllers: [KdsController],
  providers: [
    KdsGateway,
    KdsBroadcastService,
    KdsOrderQueryRepository,
    KdsOrderItemStateRepository,
    KdsCatalogLookupService,
    KdsOrderQueryService,
    KdsUpdateService,
    KdsNotificationsIntegration,
    KdsReportingIntegration,
  ],
  exports: [KdsOrderQueryService, KdsUpdateService, KdsBroadcastService],
})
export class KdsModule {}
