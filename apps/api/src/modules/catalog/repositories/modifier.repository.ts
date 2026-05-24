import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModifierEntity } from '../entities/modifier.entity';

@Injectable()
export class ModifierRepository {
  constructor(
    @InjectRepository(ModifierEntity)
    private readonly repository: Repository<ModifierEntity>,
  ) {}

  // TODO: findAllForTenant with options relation
}
