import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLogEntity } from '../../entities/integration-log.entity';
import { IntegrationLogsController } from '../../controllers/integration-logs.controller';
import { IntegrationLogsService } from '../../services/integration-logs.service';
import { IntegrationLogRepository } from '../../repositories/integration-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationLogEntity])],
  controllers: [IntegrationLogsController],
  providers: [IntegrationLogsService, IntegrationLogRepository],
  exports: [IntegrationLogsService, IntegrationLogRepository],
})
export class IntegrationLogsModule {}
