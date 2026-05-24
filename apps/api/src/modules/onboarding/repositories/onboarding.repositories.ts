import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  StaffInvitationEntity,
  TenantBillingEntity,
  TenantBrandingEntity,
  TenantMembershipEntity,
  TenantOnboardingEntity,
  TenantSettingsEntity,
} from '../entities';
import { TenantEntity } from '../../tenants/entities/tenant.entity';
import { RoleEntity } from '../../auth/entities/role.entity';
import { RolePermissionEntity } from '../../auth/entities/role-permission.entity';
import { PermissionEntity } from '../../auth/entities/permission.entity';
import { UserEntity } from '../../auth/entities/user.entity';
import { LocationEntity } from '../../tenants/entities/location.entity';
import { LocationSettingsEntity } from '../../tenants/entities/location-settings.entity';
import { StaffInvitationStatus } from '../enums/staff-invitation-status.enum';

@Injectable()
export class OnboardingRepository {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenants: Repository<TenantEntity>,
    @InjectRepository(TenantSettingsEntity)
    private readonly settings: Repository<TenantSettingsEntity>,
    @InjectRepository(TenantBrandingEntity)
    private readonly branding: Repository<TenantBrandingEntity>,
    @InjectRepository(TenantBillingEntity)
    private readonly billing: Repository<TenantBillingEntity>,
    @InjectRepository(TenantOnboardingEntity)
    private readonly onboarding: Repository<TenantOnboardingEntity>,
    @InjectRepository(StaffInvitationEntity)
    private readonly invitations: Repository<StaffInvitationEntity>,
    @InjectRepository(TenantMembershipEntity)
    private readonly memberships: Repository<TenantMembershipEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissions: Repository<RolePermissionEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(LocationEntity)
    private readonly locations: Repository<LocationEntity>,
    @InjectRepository(LocationSettingsEntity)
    private readonly locationSettings: Repository<LocationSettingsEntity>,
  ) {}

  tenantRepo(manager?: EntityManager): Repository<TenantEntity> {
    return manager ? manager.getRepository(TenantEntity) : this.tenants;
  }

  async findTenantBySlug(slug: string, manager?: EntityManager): Promise<TenantEntity | null> {
    return this.tenantRepo(manager).findOne({ where: { slug } });
  }

  async findTenantBySubdomain(subdomain: string): Promise<TenantEntity | null> {
    return this.tenants.findOne({ where: { subdomain } });
  }

  async findTenantById(id: string): Promise<TenantEntity | null> {
    return this.tenants.findOne({ where: { id } });
  }

  async saveTenant(tenant: Partial<TenantEntity>, manager?: EntityManager): Promise<TenantEntity> {
    return this.tenantRepo(manager).save(tenant);
  }

  async saveSettings(
    entity: Partial<TenantSettingsEntity>,
    manager?: EntityManager,
  ): Promise<TenantSettingsEntity> {
    const repo = manager ? manager.getRepository(TenantSettingsEntity) : this.settings;
    return repo.save(entity);
  }

  async findSettings(tenantId: string): Promise<TenantSettingsEntity | null> {
    return this.settings.findOne({ where: { tenantId } });
  }

  async saveBranding(
    entity: Partial<TenantBrandingEntity>,
    manager?: EntityManager,
  ): Promise<TenantBrandingEntity> {
    const repo = manager ? manager.getRepository(TenantBrandingEntity) : this.branding;
    return repo.save(entity);
  }

  async findBranding(tenantId: string): Promise<TenantBrandingEntity | null> {
    return this.branding.findOne({ where: { tenantId } });
  }

  async saveBilling(
    entity: Partial<TenantBillingEntity>,
    manager?: EntityManager,
  ): Promise<TenantBillingEntity> {
    const repo = manager ? manager.getRepository(TenantBillingEntity) : this.billing;
    return repo.save(entity);
  }

  async findBilling(tenantId: string): Promise<TenantBillingEntity | null> {
    return this.billing.findOne({ where: { tenantId } });
  }

  async saveOnboarding(
    entity: Partial<TenantOnboardingEntity>,
    manager?: EntityManager,
  ): Promise<TenantOnboardingEntity> {
    const repo = manager ? manager.getRepository(TenantOnboardingEntity) : this.onboarding;
    return repo.save(entity);
  }

  async findOnboarding(tenantId: string): Promise<TenantOnboardingEntity | null> {
    return this.onboarding.findOne({ where: { tenantId } });
  }

  async saveRole(role: Partial<RoleEntity>, manager?: EntityManager): Promise<RoleEntity> {
    const repo = manager ? manager.getRepository(RoleEntity) : this.roles;
    return repo.save(role);
  }

  async findRoleByName(tenantId: string, name: string): Promise<RoleEntity | null> {
    return this.roles.findOne({ where: { tenantId, name } });
  }

  async findRolesForTenant(tenantId: string): Promise<RoleEntity[]> {
    return this.roles.find({ where: { tenantId } });
  }

  async ensurePermission(key: string, manager?: EntityManager): Promise<PermissionEntity> {
    const repo = manager ? manager.getRepository(PermissionEntity) : this.permissions;
    const existing = await repo.findOne({ where: { key } });
    if (existing) return existing;
    return repo.save({ key, description: key });
  }

  async assignPermission(roleId: string, permissionId: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(RolePermissionEntity) : this.rolePermissions;
    const existing = await repo.findOne({ where: { roleId, permissionId } });
    if (existing) return;
    await repo.save({ roleId, permissionId });
  }

  async saveUser(user: Partial<UserEntity>, manager?: EntityManager): Promise<UserEntity> {
    const repo = manager ? manager.getRepository(UserEntity) : this.users;
    return repo.save(user);
  }

  async findUserByEmail(tenantId: string, email: string): Promise<UserEntity | null> {
    return this.users.findOne({ where: { tenantId, email: email.toLowerCase() }, relations: ['role'] });
  }

  async findUsersByEmail(email: string): Promise<UserEntity[]> {
    return this.users.find({ where: { email: email.toLowerCase() }, relations: ['role'] });
  }

  async listUsersForTenant(tenantId: string): Promise<UserEntity[]> {
    return this.users.find({ where: { tenantId }, relations: ['role'] });
  }

  async saveMembership(
    entity: Partial<TenantMembershipEntity>,
    manager?: EntityManager,
  ): Promise<TenantMembershipEntity> {
    const repo = manager ? manager.getRepository(TenantMembershipEntity) : this.memberships;
    return repo.save(entity);
  }

  async listMembershipsForUser(userId: string): Promise<TenantMembershipEntity[]> {
    return this.memberships.find({
      where: { userId, isActive: true },
      relations: ['tenant', 'role'],
    });
  }

  async findMembership(
    tenantId: string,
    userId: string,
  ): Promise<TenantMembershipEntity | null> {
    return this.memberships.findOne({ where: { tenantId, userId } });
  }

  async saveInvitation(entity: Partial<StaffInvitationEntity>): Promise<StaffInvitationEntity> {
    return this.invitations.save(entity);
  }

  async listInvitations(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.invitations.find({
      where: { tenantId, status: StaffInvitationStatus.PENDING },
      relations: ['role'],
    });
  }

  async saveLocation(entity: Partial<LocationEntity>, manager?: EntityManager): Promise<LocationEntity> {
    const repo = manager ? manager.getRepository(LocationEntity) : this.locations;
    return repo.save(entity);
  }

  async saveLocationSettings(
    entity: Partial<LocationSettingsEntity>,
    manager?: EntityManager,
  ): Promise<LocationSettingsEntity> {
    const repo = manager ? manager.getRepository(LocationSettingsEntity) : this.locationSettings;
    return repo.save(entity);
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const rows = await this.rolePermissions.find({
      where: { roleId },
      relations: ['permission'],
    });
    return rows.map((row) => row.permission.key);
  }
}
