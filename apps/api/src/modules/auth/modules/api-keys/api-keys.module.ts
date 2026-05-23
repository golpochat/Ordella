import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysController } from '../../controllers/api-keys.controller';
import { ApiKeysService } from '../../services/api-keys.service';
import { ApiKeyRepository } from '../../repositories/api-key.repository';
import { ApiKeyEntity } from '../../entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyRepository],
  exports: [ApiKeysService, ApiKeyRepository],
})
export class ApiKeysModule {}
