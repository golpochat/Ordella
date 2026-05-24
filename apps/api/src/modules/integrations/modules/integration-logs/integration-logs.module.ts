import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLogEntity } from '../../entities';
import { IntegrationLogsController } from '../../controllers';
import { IntegrationLogsService } from '../../services';
import { IntegrationLogRepository } from '../../repositories/integration-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationLogEntity])],
  controllers: [IntegrationLogsController],
  providers: [IntegrationLogsService, IntegrationLogRepository],
  exports: [],
})
export class IntegrationLogsModule {}
