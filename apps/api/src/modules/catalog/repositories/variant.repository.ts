import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VariantEntity } from '../entities';

@Injectable()
export class VariantRepository {
  constructor(
    @InjectRepository(VariantEntity)
    private readonly repository: Repository<VariantEntity>,
  ) {}

  // TODO: findAllForTenant via product join, findById, create, update, remove
}
