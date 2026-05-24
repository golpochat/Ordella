import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { FilterPaginationDto } from '../../auth/dto/filter-pagination.dto';
import { CreateDriverDto } from '../dto/drivers/create-driver.dto';
import { DriverResponseDto } from '../dto/drivers/driver-response.dto';
import { UpdateDriverDto } from '../dto/drivers/update-driver.dto';

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
