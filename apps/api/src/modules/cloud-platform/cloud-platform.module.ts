import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { CloudPlatformController } from './controllers/cloud-platform.controller';
import { CLOUD_PLATFORM_ENTITIES } from './entities';
import { CloudPlatformService } from './services/cloud-platform.service';

@Module({
  imports: [AuditModule, AuthModule, TypeOrmModule.forFeature([...CLOUD_PLATFORM_ENTITIES])],
  controllers: [CloudPlatformController],
  providers: [CloudPlatformService],
  exports: [CloudPlatformService],
})
export class CloudPlatformModule {}
