import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysController } from '../../controllers';
import { ApiKeysService } from '../../services';
import { ApiKeyRepository } from '../../repositories/api-key.repository';
import { ApiKeyEntity, ApiKeyUsageLogEntity } from '../../entities';
import { AuditLogEntity } from '../../../audit/entities';
import { RateLimitService } from '../../../../platform/security/rate-limit.service';
import { ApiKeyAuthGuard } from '../../guards';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity, ApiKeyUsageLogEntity, AuditLogEntity])],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyRepository, ApiKeyAuthGuard, RateLimitService],
  exports: [ApiKeysService, ApiKeyAuthGuard],
})
export class ApiKeysModule {}
