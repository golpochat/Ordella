import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverProfileEntity } from '../entities';

@Injectable()
export class DriverProfileRepository {
  constructor(
    @InjectRepository(DriverProfileEntity)
    private readonly repository: Repository<DriverProfileEntity>,
  ) {}

  // TODO: findAllForTenant, findByIdForTenant, create, update, remove
}
