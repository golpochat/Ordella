import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportResultEntity } from '../entities/report-result.entity';

@Injectable()
export class ReportResultRepository {
  constructor(
    @InjectRepository(ReportResultEntity)
    private readonly repository: Repository<ReportResultEntity>,
  ) {}

  // TODO: findAllForTenant with filters, findByJobId
}
