import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { BundlesController, PublicBundlesController } from './controllers';
import { BUNDLE_ENTITIES } from './entities';
import { BundlesService } from './services';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([...BUNDLE_ENTITIES, OrderItemEntity])],
  controllers: [BundlesController, PublicBundlesController],
  providers: [BundlesService],
  exports: [BundlesService],
})
export class BundlesModule {}
