import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WastageRecordEntity } from '../entities';

@Injectable()
export class WastageRecordRepository {
  constructor(
    @InjectRepository(WastageRecordEntity)
    private readonly repository: Repository<WastageRecordEntity>,
  ) {}
}
