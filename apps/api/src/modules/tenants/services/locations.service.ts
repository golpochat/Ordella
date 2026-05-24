import { Injectable, NotImplementedException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces/tenant-context.interface';
import { CreateLocationDto } from '../dto';
import { UpdateLocationDto } from '../dto';
import { UpdateLocationStatusDto } from '../dto';
import { LocationResponseDto } from '../dto';
import { UpdateLocationSettingsDto } from '../dto';
import { LocationSettingsResponseDto } from '../dto';
import { UpdateLocationOpeningHoursDto } from '../dto';
import { LocationOpeningHoursResponseDto } from '../dto';
import { FilterPaginationDto } from '../../auth/dto';

@Injectable()
export class LocationsService {
  findAll(_tenant: TenantContext, _query: FilterPaginationDto): Promise<LocationResponseDto[]> {
    throw new NotImplementedException('findAll locations');
  }

  create(_tenant: TenantContext, _dto: CreateLocationDto): Promise<LocationResponseDto> {
    throw new NotImplementedException('create location');
  }

  findOne(_tenant: TenantContext, _id: string): Promise<LocationResponseDto> {
    throw new NotImplementedException('findOne location');
  }

  update(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    throw new NotImplementedException('update location');
  }

  remove(_tenant: TenantContext, _id: string): Promise<void> {
    throw new NotImplementedException('remove location');
  }

  updateStatus(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateLocationStatusDto,
  ): Promise<LocationResponseDto> {
    throw new NotImplementedException('update location status');
  }

  getSettings(_tenant: TenantContext, _id: string): Promise<LocationSettingsResponseDto> {
    throw new NotImplementedException('get location settings');
  }

  updateSettings(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateLocationSettingsDto,
  ): Promise<LocationSettingsResponseDto> {
    throw new NotImplementedException('update location settings');
  }

  getOpeningHours(
    _tenant: TenantContext,
    _id: string,
  ): Promise<LocationOpeningHoursResponseDto> {
    throw new NotImplementedException('get location opening hours');
  }

  updateOpeningHours(
    _tenant: TenantContext,
    _id: string,
    _dto: UpdateLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto> {
    throw new NotImplementedException('update location opening hours');
  }
}
