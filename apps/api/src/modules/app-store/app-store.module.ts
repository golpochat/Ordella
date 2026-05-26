import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit';
import { AuthModule } from '../auth/auth.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { APP_STORE_ENTITIES } from './entities';
import { AppStoreController } from './controllers/app-store.controller';
import { AppStoreService } from './services/app-store.service';

@Module({
  imports: [
    AuditModule,
    AuthModule,
    IntegrationsModule,
    TypeOrmModule.forFeature(APP_STORE_ENTITIES),
  ],
  controllers: [AppStoreController],
  providers: [AppStoreService],
  exports: [AppStoreService],
})
export class AppStoreModule {}
