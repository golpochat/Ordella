import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddonEntity } from '../entities';

@Injectable()
export class AddonRepository {
  constructor(
    @InjectRepository(AddonEntity)
    private readonly repository: Repository<AddonEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update, remove
}
