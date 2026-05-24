import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateDriverDto } from '../dto';
import { DriverResponseDto } from '../dto';
import { UpdateDriverDto } from '../dto';

@Injectable()
export class DriversService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<DriverResponseDto[]> {
    throw new NotImplementedException('findAll drivers');
  }

  create(_tenant: TenantContext, _dto: CreateDriverDto): Promise<DriverResponseDto> {
    throw new NotImplementedException('create driver');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<DriverResponseDto> {
    throw new NotImplementedException('findOne driver');
  }

  update(_tenant: TenantContext, _id: string, _dto: UpdateDriverDto): Promise<DriverResponseDto> {
    throw new NotImplementedException('update driver');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove driver');
  }
}
