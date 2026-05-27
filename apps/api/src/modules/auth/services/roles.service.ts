import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ALL_PERMISSION_KEYS, SystemRoleNames } from '../../../common/rbac/role-permissions';
import { CreateRoleDto } from '../dto';
import { UpdateRolePermissionsDto } from '../dto';
import { RoleResponseDto } from '../dto';
import { FilterPaginationDto } from '../dto';
import { TenantContext } from '../../../common/interfaces';
import { PermissionEntity, RoleEntity, RolePermissionEntity, UserEntity } from '../entities';

@Injectable()
export class RolesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissions: Repository<RolePermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async findAll(tenant: TenantContext, query: FilterPaginationDto): Promise<RoleResponseDto[]> {
    await this.ensureDefaultRoles(tenant.tenantId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const roles = await this.roles.find({
      where: { tenantId: tenant.tenantId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return roles.map((role) => this.toResponse(role));
  }

  async create(tenant: TenantContext, dto: CreateRoleDto): Promise<RoleResponseDto> {
    const name = dto.name.trim().toLowerCase();
    const existing = await this.roles.findOne({ where: { tenantId: tenant.tenantId, name } });
    if (existing) {
      throw new BadRequestException('Role already exists');
    }

    const role = await this.roles.save(
      this.roles.create({
        tenantId: tenant.tenantId,
        name,
        description: dto.description ?? null,
      }),
    );
    await this.setPermissions(role.id, dto.permissions ?? []);
    return this.requireRoleResponse(tenant.tenantId, role.id);
  }

  async update(
    tenant: TenantContext,
    roleId: string,
    dto: Partial<CreateRoleDto & UpdateRolePermissionsDto>,
  ): Promise<RoleResponseDto> {
    const role = await this.requireRole(tenant.tenantId, roleId);
    if (role.name === SystemRoleNames.OWNER && dto.name && dto.name !== role.name) {
      throw new BadRequestException('Owner role cannot be renamed');
    }

    if (dto.name !== undefined) {
      role.name = dto.name.trim().toLowerCase();
    }
    if (dto.description !== undefined) {
      role.description = dto.description ?? null;
    }
    await this.roles.save(role);

    const keys = dto.permissions ?? dto.permissionKeys;
    if (keys !== undefined || dto.permissionIds !== undefined) {
      await this.setPermissions(role.id, keys ?? [], dto.permissionIds);
    }

    return this.requireRoleResponse(tenant.tenantId, role.id);
  }

  async assignPermissions(
    tenant: TenantContext,
    roleId: string,
    dto: UpdateRolePermissionsDto,
  ): Promise<void> {
    await this.requireRole(tenant.tenantId, roleId);
    await this.setPermissions(roleId, dto.permissionKeys ?? [], dto.permissionIds);
  }

  async remove(tenant: TenantContext, roleId: string): Promise<void> {
    const role = await this.requireRole(tenant.tenantId, roleId);
    if (role.name === SystemRoleNames.OWNER) {
      throw new BadRequestException('Owner role cannot be deleted');
    }
    const usersWithRole = await this.users.count({ where: { tenantId: tenant.tenantId, roleId } });
    if (usersWithRole > 0) {
      throw new BadRequestException('Cannot delete a role assigned to staff');
    }
    await this.roles.delete({ id: roleId, tenantId: tenant.tenantId });
  }

  async duplicate(tenant: TenantContext, roleId: string): Promise<RoleResponseDto> {
    const role = await this.requireRoleResponse(tenant.tenantId, roleId);
    return this.create(tenant, {
      name: `${role.name} copy`,
      description: role.description ?? undefined,
      permissions: role.permissions,
    });
  }

  async ensureDefaultRoles(tenantId: string): Promise<void> {
    const existing = await this.roles.find({ where: { tenantId } });
    const existingNames = new Set(existing.map((role) => role.name));
    for (const roleName of [
      SystemRoleNames.OWNER,
      SystemRoleNames.MANAGER,
      SystemRoleNames.STAFF,
      SystemRoleNames.DRIVER,
      SystemRoleNames.FULFILLMENT,
    ]) {
      if (existingNames.has(roleName)) {
        continue;
      }
      const role = await this.roles.save(
        this.roles.create({
          tenantId,
          name: roleName,
          description: `Default ${roleName} role`,
        }),
      );
      await this.setPermissions(role.id, ROLE_DEFAULTS[roleName] ?? []);
    }
  }

  private async setPermissions(
    roleId: string,
    permissionKeys: string[],
    permissionIds?: string[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const permissionRepo = manager.getRepository(PermissionEntity);
      const rolePermissionRepo = manager.getRepository(RolePermissionEntity);
      const ids = new Set(permissionIds ?? []);
      for (const key of permissionKeys) {
        const permission = await this.ensurePermission(key, permissionRepo);
        ids.add(permission.id);
      }
      await rolePermissionRepo.delete({ roleId });
      if (ids.size === 0) {
        return;
      }
      const valid = await permissionRepo.find({ where: { id: In([...ids]) } });
      await rolePermissionRepo.save(
        valid.map((permission) =>
          rolePermissionRepo.create({ roleId, permissionId: permission.id }),
        ),
      );
    });
  }

  private async ensurePermission(
    key: string,
    repository = this.permissions,
  ): Promise<PermissionEntity> {
    const existing = await repository.findOne({ where: { key } });
    if (existing) {
      return existing;
    }
    return repository.save(repository.create({ key, description: key }));
  }

  private async requireRole(tenantId: string, roleId: string): Promise<RoleEntity> {
    const role = await this.roles.findOne({ where: { id: roleId, tenantId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async requireRoleResponse(tenantId: string, roleId: string): Promise<RoleResponseDto> {
    const role = await this.roles.findOne({
      where: { id: roleId, tenantId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.toResponse(role);
  }

  private toResponse(role: RoleEntity): RoleResponseDto {
    const permissions =
      role.rolePermissions?.map((rp) => rp.permission?.key).filter(Boolean).sort() ?? [];
    return {
      id: role.id,
      tenantId: role.tenantId,
      name: role.name,
      description: role.description,
      permissions,
      isSystemRole: Object.values(SystemRoleNames).includes(role.name as never),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

const ROLE_DEFAULTS = Object.fromEntries(
  Object.entries({
    [SystemRoleNames.OWNER]: ALL_PERMISSION_KEYS,
    [SystemRoleNames.MANAGER]: [
      'catalog.read',
      'catalog.write',
      'inventory.read',
      'inventory.write',
      'orders.read',
      'orders.write',
      'fulfillment.read',
      'fulfillment.write',
      'staff.read',
      'staff.write',
      'locations.read',
      'locations.write',
      'analytics.read',
      'admin:access',
      'admin:products',
      'admin:inventory',
      'admin:orders',
      'admin:reports',
      'enterprise.read',
      'enterprise.dashboard',
      'regions.read',
      'app-store.read',
      'app-store.install',
      'app-store.review',
      'app-store.billing',
      'app-store.analytics',
      'partner-network.read',
      'partner-network.manage',
      'partner-network.approve',
      'partner-network.marketplace',
      'partner-network.revenue',
      'partner-network.analytics',
      'compliance-suite.read',
      'compliance-suite.manage',
      'compliance-suite.controls',
      'compliance-suite.policies',
      'compliance-suite.evidence',
      'compliance-suite.incidents',
      'compliance-suite.security',
      'compliance-suite.governance',
      'compliance-suite.audit',
      'compliance-suite.auditor',
      'compliance-suite.procurement',
      'cloud-platform.read',
      'cloud-platform.admin',
      'cloud-platform.regions',
      'cloud-platform.infrastructure',
      'cloud-platform.deploy',
      'cloud-platform.governance',
      'cloud-platform.monitoring',
      'cloud-platform.security',
      'retail-genome.read',
      'retail-genome.admin',
      'retail-genome.ingest',
      'retail-genome.query',
      'retail-genome.search',
      'retail-genome.reasoning',
      'retail-genome.federated',
      'retail-genome.governance',
      'hardware.read',
      'hardware.write',
      'hardware.command',
      'ai-assistant.read',
      'ai-assistant.insights',
      'ai-assistant.actions',
      'ai-assistant.approve',
      'ai-assistant.controls',
      'ai-assistant.analytics',
      'offline-sync.read',
      'offline-sync.push',
      'offline-sync.devices',
      'offline-sync.controls',
      'offline-sync.logs',
      'offline-sync.conflicts',
      'offline-sync.resolve',
      'offline-sync.force',
      'event-bus.read',
      'event-bus.publish',
      'event-bus.subscribe',
      'event-bus.replay',
      'event-bus.admin',
      'globalization.read',
      'globalization.admin',
      'globalization.tax',
      'globalization.compliance',
      'globalization.reporting',
      'data-lake.read',
      'data-lake.ingest',
      'data-lake.admin',
      'data-lake.query',
      'data-lake.export',
      'data-lake.governance',
      'orchestration.read',
      'orchestration.admin',
      'orchestration.run',
      'orchestration.approve',
      'digital-twins.read',
      'digital-twins.admin',
      'digital-twins.simulate',
      'autonomous.read',
      'autonomous.admin',
      'autonomous.run',
      'autonomous.approve',
      'permissions:read',
      'pos:catalog',
      'pos:cart',
      'pos:checkout',
      'pos:payment',
      'pos:receipt',
      'kds:access',
      'kds:read',
      'kds:update',
    ],
    [SystemRoleNames.STAFF]: [
      'orders.read',
      'orders.write',
      'fulfillment.read',
      'fulfillment.write',
      'pos:access',
      'pos:catalog',
      'pos:cart',
      'pos:checkout',
      'pos:payment',
      'pos:receipt',
      'kds:access',
      'kds:read',
      'kds:update',
      'offline-sync.read',
      'offline-sync.push',
    ],
    [SystemRoleNames.DRIVER]: ['deliveries:read', 'deliveries:update', 'offline-sync.read', 'offline-sync.push'],
    [SystemRoleNames.FULFILLMENT]: [
      'fulfillment.read',
      'fulfillment.write',
      'kds:access',
      'kds:read',
      'kds:update',
      'orders:read',
      'offline-sync.read',
      'offline-sync.push',
    ],
  }),
);
