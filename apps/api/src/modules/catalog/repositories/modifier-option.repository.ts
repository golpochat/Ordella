import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModifierOptionEntity } from '../entities';

@Injectable()
export class ModifierOptionRepository {
  constructor(
    @InjectRepository(ModifierOptionEntity)
    private readonly repository: Repository<ModifierOptionEntity>,
  ) {}

  // TODO: findByModifierId, replaceForModifier
}
