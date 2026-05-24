import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportJobEntity } from '../entities/report-job.entity';

@Injectable()
export class ReportJobRepository {
  constructor(
    @InjectRepository(ReportJobEntity)
    private readonly repository: Repository<ReportJobEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, updateStatus
}
