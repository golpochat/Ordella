import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { FilterPaginationDto } from '../../../common/dto';
import { TenantContext } from '../../../common/interfaces';
import { UserEntity } from '../../auth/entities/user.entity';
import { StockItemEntity } from '../../inventory/entities/stock-item.entity';
import { OrderEntity } from '../../orders/entities/order.entity';
import { UsageTrackingService } from '../../billing/services/usage-tracking.service';
import {
  defaultLocationSettings,
  defaultOpeningHoursRows,
  DEFAULT_TIMEZONE,
} from '../../onboarding/constants/default-provisioning';
import { CreateLocationDto } from '../dto';
import { UpdateLocationDto } from '../dto';
import { UpdateLocationStatusDto } from '../dto';
import { LocationResponseDto } from '../dto';
import { UpdateLocationSettingsDto } from '../dto';
import { LocationSettingsResponseDto } from '../dto';
import { UpdateLocationOpeningHoursDto } from '../dto';
import { LocationOpeningHoursResponseDto } from '../dto';
import { LocationDetailResponseDto } from '../dto/locations/location-detail-response.dto';
import { LocationListItemResponseDto } from '../dto/locations/location-list-item-response.dto';
import { AssignLocationStaffDto } from '../dto/locations/assign-location-staff.dto';
import { LocationEntity } from '../entities/location.entity';
import { LocationStatus } from '../enums/location-status.enum';
import {
  locationIsActive,
  slugifyLocationName,
  toLocationDetailDto,
  toLocationListItemDto,
  toLocationResponseDto,
} from '../mappers/location.mapper';
import { LocationOpeningHoursRepository } from '../repositories/location-opening-hours.repository';
import { LocationSettingsRepository } from '../repositories/location-settings.repository';
import { LocationRepository } from '../repositories/location.repository';
import { UserLocationRepository } from '../repositories/user-location.repository';

@Injectable()
export class LocationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly locationRepository: LocationRepository,
    private readonly settingsRepository: LocationSettingsRepository,
    private readonly hoursRepository: LocationOpeningHoursRepository,
    private readonly userLocationRepository: UserLocationRepository,
    private readonly usageTracking: UsageTrackingService,
    @InjectRepository(StockItemEntity)
    private readonly stockRepository: Repository<StockItemEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(
    tenant: TenantContext,
    _query: FilterPaginationDto,
  ): Promise<LocationListItemResponseDto[]> {
    const locations = await this.locationRepository.findAllForTenant(tenant.tenantId);
    const results: LocationListItemResponseDto[] = [];

    for (const location of locations) {
      const settingsRow = await this.settingsRepository.findByLocationId(location.id);
      const settings = settingsRow?.settings ?? defaultLocationSettings();
      const inventory = await this.inventorySummary(tenant.tenantId, location.id);
      const staffCount = await this.resolveStaffCount(tenant.tenantId, location.id);
      results.push(
        toLocationListItemDto(location, settings, {
          staffCount,
          lowStockCount: inventory.lowStockCount,
          totalStockItems: inventory.totalStockItems,
        }),
      );
    }

    return results;
  }

  async create(tenant: TenantContext, dto: CreateLocationDto): Promise<LocationDetailResponseDto> {
    await this.usageTracking.assertWithinLimits(tenant.tenantId, 'location');

    const slug = await this.ensureUniqueSlug(tenant.tenantId, dto.slug ?? slugifyLocationName(dto.name));
    const settings = {
      ...defaultLocationSettings(),
      phone: dto.phone ?? '',
      currency: dto.currency ?? defaultLocationSettings().currency,
      slug,
      deliverySettings: {
        radiusKm: 5,
        deliveryFee: 0,
        freeDeliveryThreshold: null,
      },
    };

    const location = await this.dataSource.transaction(async (manager) => {
      const locRepo = manager.getRepository(LocationEntity);
      const saved = await locRepo.save(
        locRepo.create({
          tenantId: tenant.tenantId,
          storeId: dto.storeId ?? null,
          name: dto.name.trim(),
          address: dto.address?.trim() ?? null,
          timezone: dto.timezone ?? DEFAULT_TIMEZONE,
          status: dto.status ?? LocationStatus.CLOSED,
        }),
      );

      await this.settingsRepository.upsertForLocation(saved.id, settings, manager);
      await this.hoursRepository.replaceForLocation(
        saved.id,
        defaultOpeningHoursRows(),
        manager,
      );

      await this.usageTracking.recordLocationUsage(tenant.tenantId);
      return saved;
    });

    return this.buildDetail(tenant.tenantId, location.id);
  }

  async findOne(tenant: TenantContext, id: string): Promise<LocationDetailResponseDto> {
    return this.buildDetail(tenant.tenantId, id);
  }

  async update(
    tenant: TenantContext,
    id: string,
    dto: UpdateLocationDto,
  ): Promise<LocationDetailResponseDto> {
    const location = await this.requireLocation(tenant.tenantId, id);

    if (dto.name !== undefined) {
      location.name = dto.name.trim();
    }
    if (dto.address !== undefined) {
      location.address = dto.address?.trim() ?? null;
    }
    if (dto.timezone !== undefined) {
      location.timezone = dto.timezone;
    }
    if (dto.storeId !== undefined) {
      location.storeId = dto.storeId ?? null;
    }
    if (dto.status !== undefined) {
      location.status = dto.status;
    }

    await this.locationRepository.save(location);

    const patch: Record<string, unknown> = {};
    if (dto.phone !== undefined) {
      patch.phone = dto.phone;
    }
    if (dto.currency !== undefined) {
      patch.currency = dto.currency;
    }
    if (dto.slug !== undefined) {
      patch.slug = await this.ensureUniqueSlug(tenant.tenantId, dto.slug, id);
    }
    if (Object.keys(patch).length > 0) {
      await this.settingsRepository.mergeSettings(location.id, patch);
    }

    return this.buildDetail(tenant.tenantId, id);
  }

  async remove(tenant: TenantContext, id: string): Promise<void> {
    await this.requireLocation(tenant.tenantId, id);

    const orderCount = await this.orderRepository.count({
      where: { tenantId: tenant.tenantId, locationId: id },
    });
    if (orderCount > 0) {
      await this.locationRepository.updateStatus(tenant.tenantId, id, LocationStatus.CLOSED);
      return;
    }

    const deleted = await this.locationRepository.remove(tenant.tenantId, id);
    if (!deleted) {
      throw new NotFoundException('Location not found');
    }
  }

  async updateStatus(
    tenant: TenantContext,
    id: string,
    dto: UpdateLocationStatusDto,
  ): Promise<LocationResponseDto> {
    const updated = await this.locationRepository.updateStatus(
      tenant.tenantId,
      id,
      dto.status,
    );
    if (!updated) {
      throw new NotFoundException('Location not found');
    }
    return toLocationResponseDto(updated);
  }

  async getSettings(
    tenant: TenantContext,
    id: string,
  ): Promise<LocationSettingsResponseDto> {
    await this.requireLocation(tenant.tenantId, id);
    const row = await this.settingsRepository.findByLocationId(id);
    return {
      locationId: id,
      settings: row?.settings ?? defaultLocationSettings(),
    };
  }

  async updateSettings(
    tenant: TenantContext,
    id: string,
    dto: UpdateLocationSettingsDto,
  ): Promise<LocationSettingsResponseDto> {
    await this.requireLocation(tenant.tenantId, id);
    const row = await this.settingsRepository.mergeSettings(id, dto.settings);
    return { locationId: id, settings: row.settings };
  }

  async getOpeningHours(
    tenant: TenantContext,
    id: string,
  ): Promise<LocationOpeningHoursResponseDto> {
    await this.requireLocation(tenant.tenantId, id);
    const hours = await this.hoursRepository.findByLocationId(id);
    return { locationId: id, hours: this.mapHoursResponse(hours) };
  }

  async updateOpeningHours(
    tenant: TenantContext,
    id: string,
    dto: UpdateLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto> {
    await this.requireLocation(tenant.tenantId, id);
    const hours = await this.hoursRepository.replaceForLocation(id, dto.hours);
    return { locationId: id, hours: this.mapHoursResponse(hours) };
  }

  private mapHoursResponse(
    hours: import('../entities/location-opening-hours.entity').LocationOpeningHoursEntity[],
  ) {
    return hours.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      openTime: row.openTime ?? undefined,
      closeTime: row.closeTime ?? undefined,
      isClosed: row.isClosed,
    }));
  }

  async listStaff(tenant: TenantContext, locationId: string) {
    await this.requireLocation(tenant.tenantId, locationId);
    const userIds = await this.userLocationRepository.listUserIdsForLocation(
      tenant.tenantId,
      locationId,
    );
    if (userIds.length === 0) {
      const allUsers = await this.userRepository.find({
        where: { tenantId: tenant.tenantId },
        relations: ['role'],
      });
      return allUsers.map((user) => ({
        userId: user.id,
        name: user.name,
        email: user.email,
        roleName: user.role?.name ?? null,
        assigned: false,
      }));
    }

    const users = await this.userRepository.find({
      where: { tenantId: tenant.tenantId, id: In(userIds) },
      relations: ['role'],
    });
    return users.map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role?.name ?? null,
      assigned: true,
    }));
  }

  async assignStaff(
    tenant: TenantContext,
    locationId: string,
    dto: AssignLocationStaffDto,
  ): Promise<{ assigned: number }> {
    await this.requireLocation(tenant.tenantId, locationId);

    for (const userId of dto.userIds) {
      const user = await this.userRepository.findOne({
        where: { id: userId, tenantId: tenant.tenantId },
      });
      if (!user) {
        throw new BadRequestException(`User ${userId} not found for this business`);
      }
    }

    await this.userLocationRepository.replaceAssignments(
      tenant.tenantId,
      locationId,
      dto.userIds,
    );

    return { assigned: dto.userIds.length };
  }

  async listPublicLocations(tenantId: string) {
    const locations = await this.locationRepository.findAllForTenant(tenantId);
    const active = locations.filter((loc) => locationIsActive(loc.status));

    return Promise.all(
      active.map(async (location) => {
        const settingsRow = await this.settingsRepository.findByLocationId(location.id);
        const settings = settingsRow?.settings ?? defaultLocationSettings();
        return {
          id: location.id,
          name: location.name,
          slug: (settings.slug as string) ?? slugifyLocationName(location.name),
          address: location.address,
          timezone: location.timezone,
          currency: (settings.currency as string) ?? 'EUR',
          phone: (settings.phone as string) ?? '',
        };
      }),
    );
  }

  async resolvePublicLocation(tenantId: string, slugOrId: string) {
    const byId = await this.locationRepository.findByIdForTenant(tenantId, slugOrId);
    if (byId && locationIsActive(byId.status)) {
      return this.toPublicView(byId);
    }

    const locations = await this.locationRepository.findAllForTenant(tenantId);
    for (const location of locations) {
      if (!locationIsActive(location.status)) {
        continue;
      }
      const settingsRow = await this.settingsRepository.findByLocationId(location.id);
      const slug =
        (settingsRow?.settings?.slug as string) ?? slugifyLocationName(location.name);
      if (slug === slugOrId) {
        return this.toPublicView(location, settingsRow?.settings);
      }
    }

    throw new NotFoundException('Location not found');
  }

  private async toPublicView(
    location: import('../entities').LocationEntity,
    settings?: Record<string, unknown>,
  ) {
    const resolved = settings ?? (await this.settingsRepository.findByLocationId(location.id))?.settings;
    const merged = { ...defaultLocationSettings(), ...(resolved ?? {}) };
    return {
      id: location.id,
      name: location.name,
      slug: (merged.slug as string) ?? slugifyLocationName(location.name),
      address: location.address,
      timezone: location.timezone,
      currency: (merged.currency as string) ?? 'EUR',
      phone: (merged.phone as string) ?? '',
    };
  }

  private async buildDetail(tenantId: string, id: string): Promise<LocationDetailResponseDto> {
    const location = await this.requireLocation(tenantId, id);
    const settingsRow = await this.settingsRepository.findByLocationId(id);
    const settings = settingsRow?.settings ?? defaultLocationSettings();
    const hours = await this.hoursRepository.findByLocationId(id);
    const inventory = await this.inventorySummary(tenantId, id);
    const staffCount = await this.resolveStaffCount(tenantId, id);

    return toLocationDetailDto(location, settings, hours, {
      staffCount,
      lowStockCount: inventory.lowStockCount,
      totalStockItems: inventory.totalStockItems,
    });
  }

  private async requireLocation(tenantId: string, id: string) {
    const location = await this.locationRepository.findByIdForTenant(tenantId, id);
    if (!location) {
      throw new NotFoundException('Location not found');
    }
    return location;
  }

  private async inventorySummary(tenantId: string, locationId: string) {
    const items = await this.stockRepository.find({
      where: { tenantId, locationId },
    });
    let lowStockCount = 0;
    for (const item of items) {
      const onHand = parseFloat(item.quantityOnHand);
      const reorder = item.reorderLevel ? parseFloat(item.reorderLevel) : null;
      if (reorder !== null && onHand <= reorder) {
        lowStockCount += 1;
      }
    }
    return { totalStockItems: items.length, lowStockCount };
  }

  private async resolveStaffCount(tenantId: string, locationId: string): Promise<number> {
    const assigned = await this.userLocationRepository.countStaffForLocation(
      tenantId,
      locationId,
    );
    if (assigned > 0) {
      return assigned;
    }
    return this.userRepository.count({ where: { tenantId } });
  }

  private async ensureUniqueSlug(
    tenantId: string,
    baseSlug: string,
    excludeLocationId?: string,
  ): Promise<string> {
    const slug = slugifyLocationName(baseSlug);
    const locations = await this.locationRepository.findAllForTenant(tenantId);
    let candidate = slug;
    let suffix = 2;

    while (true) {
      let taken = false;
      for (const loc of locations) {
        if (excludeLocationId && loc.id === excludeLocationId) {
          continue;
        }
        const settings = await this.settingsRepository.findByLocationId(loc.id);
        const existing =
          (settings?.settings?.slug as string) ?? slugifyLocationName(loc.name);
        if (existing === candidate) {
          taken = true;
          break;
        }
      }
      if (!taken) {
        return candidate;
      }
      candidate = `${slug}-${suffix}`;
      suffix += 1;
    }
  }
}
