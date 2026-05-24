import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateWastageRecordDto } from '../dto/wastage/create-wastage-record.dto';
import { WastageRecordResponseDto } from '../dto/wastage/wastage-record-response.dto';

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
