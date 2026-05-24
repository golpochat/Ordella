import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateWastageRecordDto } from '../dto';
import { WastageRecordResponseDto } from '../dto';

@Injectable()
export class WastageRecordsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<WastageRecordResponseDto[]> {
    throw new NotImplementedException('findAll wastage-records');
  }

  create(_tenant: TenantContext, _dto: CreateWastageRecordDto): Promise<WastageRecordResponseDto> {
    throw new NotImplementedException('create wastage-record');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<WastageRecordResponseDto> {
    throw new NotImplementedException('findOne wastage-record');
  }
}
