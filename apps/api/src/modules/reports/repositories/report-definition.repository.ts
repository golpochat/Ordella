import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportDefinitionEntity } from '../entities/report-definition.entity';

@Injectable()
export class ReportDefinitionRepository {
  constructor(
    @InjectRepository(ReportDefinitionEntity)
    private readonly repository: Repository<ReportDefinitionEntity>,
  ) {}

  // TODO: findAllActive, findBySlug, create, update
}
