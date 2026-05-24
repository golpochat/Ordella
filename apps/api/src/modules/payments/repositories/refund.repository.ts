import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity } from '../entities';

@Injectable()
export class RefundRepository {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly repository: Repository<RefundEntity>,
  ) {}

  // TODO: findById, create
}
