import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { PaginationQueryDto } from '../../auth/dto/pagination-query.dto';
import {
  CreateWastageRecordDto,
  WastageRecordResponseDto,
} from '../dto/wastage/wastage-record.dto';

@Injectable()
export class WastageRecordsService {
  findAll(_tenant: TenantContext, _query: PaginationQueryDto): Promise<WastageRecordResponseDto[]> {
    throw new NotImplementedException('findAll wastage-records');
  }

  create(_tenant: TenantContext, _dto: CreateWastageRecordDto): Promise<WastageRecordResponseDto> {
    throw new NotImplementedException('create wastage-record');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<WastageRecordResponseDto> {
    throw new NotImplementedException('findOne wastage-record');
  }
}
