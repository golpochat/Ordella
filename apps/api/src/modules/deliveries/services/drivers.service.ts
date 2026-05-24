import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../common/interfaces';
import { FilterPaginationDto } from '../../../common/dto';
import { CreateDriverDto } from '../dto';
import { DriverResponseDto } from '../dto';
import { UpdateDriverDto } from '../dto';
import { DriverProfileRepository } from '../repositories/driver-profile.repository';
import { DriverProfileEntity } from '../entities/driver-profile.entity';

function toDriverResponseDto(driver: DriverProfileEntity): DriverResponseDto {
  return {
    id: driver.id,
    tenantId: driver.tenantId,
    userId: driver.userId,
    name: driver.name,
    phone: driver.phone,
    status: driver.status,
    active: driver.active,
    vehicleType: driver.vehicleType,
    createdAt: driver.createdAt,
    updatedAt: driver.updatedAt,
  };
}

@Injectable()
export class DriversService {
  constructor(private readonly driverRepository: DriverProfileRepository) {}

  async findAll(tenant: TenantContext, _query: FilterPaginationDto): Promise<DriverResponseDto[]> {
    const drivers = await this.driverRepository.findAllForTenant(tenant.tenantId);
    return drivers.map(toDriverResponseDto);
  }

  async create(tenant: TenantContext, dto: CreateDriverDto): Promise<DriverResponseDto> {
    const driver = await this.driverRepository.createForTenant(tenant.tenantId, dto);
    return toDriverResponseDto(driver);
  }

  async findOne(tenant: TenantContext, id: string): Promise<DriverResponseDto> {
    const driver = await this.driverRepository.findByIdForTenant(tenant.tenantId, id);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return toDriverResponseDto(driver);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateDriverDto,
  ): Promise<DriverResponseDto> {
    const driver = await this.driverRepository.findByIdForTenant(tenant.tenantId, id);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (dto.name !== undefined) driver.name = dto.name;
    if (dto.phone !== undefined) driver.phone = dto.phone;
    if (dto.status !== undefined) driver.status = dto.status;
    if (dto.vehicleType !== undefined) driver.vehicleType = dto.vehicleType;

    const saved = await this.driverRepository.save(driver);
    return toDriverResponseDto(saved);
  }

  async remove(tenant: TenantContext, id: string): Promise<void> {
    const driver = await this.driverRepository.findByIdForTenant(tenant.tenantId, id);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    driver.active = false;
    await this.driverRepository.save(driver);
  }
}
