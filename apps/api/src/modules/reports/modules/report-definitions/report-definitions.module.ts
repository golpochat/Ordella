import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDefinitionEntity } from '../../entities/report-definition.entity';
import { ReportDefinitionsController } from '../../controllers/report-definitions.controller';
import { ReportDefinitionsService } from '../../services/report-definitions.service';
import { ReportDefinitionRepository } from '../../repositories/report-definition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportDefinitionEntity])],
  controllers: [ReportDefinitionsController],
  providers: [ReportDefinitionsService, ReportDefinitionRepository],
  exports: [ReportDefinitionsService, ReportDefinitionRepository],
})
export class ReportDefinitionsModule {}
