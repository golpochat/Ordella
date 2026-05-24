import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationProviderEntity } from '../../entities';
import { IntegrationProvidersController } from '../../controllers';
import { IntegrationProvidersService } from '../../services';
import { IntegrationProviderRepository } from '../../repositories/integration-provider.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationProviderEntity])],
  controllers: [IntegrationProvidersController],
  providers: [IntegrationProvidersService, IntegrationProviderRepository],
  exports: [],
})
export class IntegrationProvidersModule {}
