import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeysController } from '../../controllers';
import { ApiKeysService } from '../../services';
import { ApiKeyRepository } from '../../repositories/api-key.repository';
import { ApiKeyEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyRepository],
  exports: [],
})
export class ApiKeysModule {}
