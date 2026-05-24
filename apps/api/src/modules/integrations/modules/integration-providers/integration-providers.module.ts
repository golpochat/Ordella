import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationProviderEntity } from '../../entities/integration-provider.entity';
import { IntegrationProvidersController } from '../../controllers/integration-providers.controller';
import { IntegrationProvidersService } from '../../services/integration-providers.service';
import { IntegrationProviderRepository } from '../../repositories/integration-provider.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationProviderEntity])],
  controllers: [IntegrationProvidersController],
  providers: [IntegrationProvidersService, IntegrationProviderRepository],
  exports: [IntegrationProvidersService, IntegrationProviderRepository],
})
export class IntegrationProvidersModule {}
