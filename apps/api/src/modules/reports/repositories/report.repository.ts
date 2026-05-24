import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../entities';

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly repository: Repository<ReportEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create
}
