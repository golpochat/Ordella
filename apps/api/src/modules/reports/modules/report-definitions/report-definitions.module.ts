import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportDefinitionEntity } from '../../entities';
import { ReportDefinitionsController } from '../../controllers';
import { ReportDefinitionsService } from '../../services';
import { ReportDefinitionRepository } from '../../repositories/report-definition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReportDefinitionEntity])],
  controllers: [ReportDefinitionsController],
  providers: [ReportDefinitionsService, ReportDefinitionRepository],
  exports: [],
})
export class ReportDefinitionsModule {}
