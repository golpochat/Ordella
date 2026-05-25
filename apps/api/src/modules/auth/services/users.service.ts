import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TenantMembershipEntity } from '../../onboarding/entities/tenant-membership.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';
import { NotificationChannelType } from '../../notifications/enums/notification-channel-type.enum';
import { NotificationStatus } from '../../notifications/enums/notification-status.enum';
import { NotificationType } from '../../notifications/enums/notification-type.enum';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { UserLocationAssignmentEntity } from '../../tenants/entities/user-location-assignment.entity';
import { UserLocationRepository } from '../../tenants/repositories/user-location.repository';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto';
import { UserResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';
import { hashPassword } from '../../onboarding/utils/password.util';
import { RoleEntity, UserEntity } from '../entities';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(TenantMembershipEntity)
    private readonly memberships: Repository<TenantMembershipEntity>,
    @InjectRepository(UserLocationAssignmentEntity)
    private readonly locationAssignments: Repository<UserLocationAssignmentEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
    private readonly userLocationRepository: UserLocationRepository,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<UserResponseDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const users = await this.users.find({
      where: { tenantId: tenant.tenantId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return Promise.all(users.map((user) => this.toResponse(user)));
  }

  async create(tenant: TenantContext, dto: CreateUserDto): Promise<UserResponseDto> {
    const role = await this.requireRole(tenant.tenantId, dto.roleId);
    await this.assertLocationsBelongToTenant(tenant.tenantId, dto.assignedLocations ?? []);
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { tenantId: tenant.tenantId, email } });
    if (existing) {
      throw new BadRequestException('A staff member with this email already exists');
    }

    const user = await this.users.save(
      this.users.create({
        tenantId: tenant.tenantId,
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        passwordHash: await hashPassword(dto.password),
        roleId: role.id,
        mfaEnabled: dto.mfaEnabled ?? false,
        status: UserStatus.ACTIVE,
      }),
    );

    await this.memberships.save(
      this.memberships.create({
        tenantId: tenant.tenantId,
        userId: user.id,
        roleId: role.id,
        isActive: true,
      }),
    );
    await this.userLocationRepository.replaceAssignmentsForUser(
      tenant.tenantId,
      user.id,
      dto.assignedLocations ?? [],
    );
    await this.recordStaffNotification(tenant.tenantId, user.id, 'staff_invite', {
      staffName: user.name,
      roleName: role.name,
    });

    return this.findOne(tenant, user.id);
  }

  async findOne(tenant: TenantContext, id: string): Promise<UserResponseDto> {
    const user = await this.requireUser(tenant.tenantId, id);
    return this.toResponse(user);
  }

  async update(tenant: TenantContext, id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.requireUser(tenant.tenantId, id);
    if (dto.roleId !== undefined) {
      const role = await this.requireRole(tenant.tenantId, dto.roleId);
      user.roleId = role.id;
      await this.syncMembershipRole(tenant.tenantId, user.id, role.id);
      await this.recordStaffNotification(tenant.tenantId, user.id, 'role_change', {
        staffName: user.name,
        roleName: role.name,
      });
    }
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.email !== undefined) user.email = dto.email.trim().toLowerCase();
    if (dto.phone !== undefined) user.phone = dto.phone?.trim() || null;
    if (dto.password !== undefined) user.passwordHash = await hashPassword(dto.password);
    if (dto.mfaEnabled !== undefined) user.mfaEnabled = dto.mfaEnabled;
    if (dto.status !== undefined) {
      user.status = dto.status;
      await this.syncMembershipActive(tenant.tenantId, user.id, dto.status === UserStatus.ACTIVE);
    }
    if (dto.assignedLocations !== undefined) {
      await this.assertLocationsBelongToTenant(tenant.tenantId, dto.assignedLocations);
      await this.userLocationRepository.replaceAssignmentsForUser(
        tenant.tenantId,
        user.id,
        dto.assignedLocations,
      );
      await this.recordStaffNotification(tenant.tenantId, user.id, 'location_assignment', {
        staffName: user.name,
        locationCount: dto.assignedLocations.length,
      });
    }
    await this.users.save(user);
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: string): Promise<void> {
    const user = await this.requireUser(tenant.tenantId, id);
    user.status = UserStatus.INACTIVE;
    await this.users.save(user);
    await this.syncMembershipActive(tenant.tenantId, id, false);
  }

  async disable(tenant: TenantContext, id: string): Promise<UserResponseDto> {
    await this.remove(tenant, id);
    return this.findOne(tenant, id);
  }

  private async requireUser(tenantId: string, id: string): Promise<UserEntity> {
    const user = await this.users.findOne({
      where: { id, tenantId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });
    if (!user) {
      throw new NotFoundException('Staff member not found');
    }
    return user;
  }

  private async requireRole(tenantId: string, roleId: string): Promise<RoleEntity> {
    const role = await this.roles.findOne({ where: { id: roleId, tenantId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async assertLocationsBelongToTenant(
    tenantId: string,
    locationIds: string[],
  ): Promise<void> {
    const uniqueIds = [...new Set(locationIds)];
    if (uniqueIds.length === 0) {
      return;
    }
    const count = await this.locations.count({ where: { id: In(uniqueIds), tenantId } });
    if (count !== uniqueIds.length) {
      throw new BadRequestException('One or more locations do not belong to this business');
    }
  }

  private async syncMembershipRole(
    tenantId: string,
    userId: string,
    roleId: string,
  ): Promise<void> {
    const membership = await this.memberships.findOne({ where: { tenantId, userId } });
    if (!membership) {
      await this.memberships.save(
        this.memberships.create({ tenantId, userId, roleId, isActive: true }),
      );
      return;
    }
    membership.roleId = roleId;
    await this.memberships.save(membership);
  }

  private async syncMembershipActive(
    tenantId: string,
    userId: string,
    isActive: boolean,
  ): Promise<void> {
    const membership = await this.memberships.findOne({ where: { tenantId, userId } });
    if (!membership) {
      return;
    }
    membership.isActive = isActive;
    await this.memberships.save(membership);
  }

  private async toResponse(user: UserEntity): Promise<UserResponseDto> {
    const assignedLocations = await this.locationAssignments.find({
      where: { tenantId: user.tenantId, userId: user.id },
      select: ['locationId'],
    });
    const permissions =
      user.role?.rolePermissions
        ?.map((rp) => rp.permission?.key)
        .filter(Boolean)
        .sort() ?? [];
    return {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      roleName: user.role?.name ?? null,
      permissions,
      assignedLocations: assignedLocations.map((row) => row.locationId),
      isActive: user.status === UserStatus.ACTIVE,
      mfaEnabled: user.mfaEnabled,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async recordStaffNotification(
    tenantId: string,
    userId: string,
    templateName: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.notifications.save(
      this.notifications.create({
        tenantId,
        userId,
        type: NotificationType.STAFF,
        channel: NotificationChannelType.PUSH,
        recipient: null,
        payload: { templateName, ...payload },
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      }),
    );
  }
}
