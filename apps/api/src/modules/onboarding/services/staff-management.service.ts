import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { StaffInvitationStatus } from '../enums/staff-invitation-status.enum';
import { StaffInvitationEntity } from '../entities';
import { UserEntity } from '../../auth/entities/user.entity';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';
import { SystemRoleNames } from '../constants/system-roles';

@Injectable()
export class StaffManagementService {
  private readonly logger = new Logger(StaffManagementService.name);

  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async listStaff(tenantId: string): Promise<UserEntity[]> {
    return this.repository.listUsersForTenant(tenantId);
  }

  async inviteStaff(
    user: AuthenticatedUser,
    tenant: TenantContext,
    email: string,
    roleName: string,
  ): Promise<StaffInvitationEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);

    if (roleName === SystemRoleNames.ADMIN) {
      throw new BadRequestException('Cannot invite another admin via staff invite');
    }

    const role = await this.repository.findRoleByName(tenant.tenantId, roleName);
    if (!role) {
      throw new Error(`Role "${roleName}" not found`);
    }

    const token = randomBytes(24).toString('hex');
    const invitation = await this.repository.saveInvitation({
      tenantId: tenant.tenantId,
      email: email.trim().toLowerCase(),
      roleId: role.id,
      invitedBy: user.id,
      status: StaffInvitationStatus.PENDING,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    this.logger.log(
      `[placeholder] staff invite email to=${invitation.email} token=${invitation.token}`,
    );

    return invitation;
  }

  async assignRole(
    user: AuthenticatedUser,
    tenant: TenantContext,
    staffUserId: string,
    roleName: string,
  ): Promise<UserEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const role = await this.repository.findRoleByName(tenant.tenantId, roleName);
    if (!role) {
      throw new Error(`Role "${roleName}" not found`);
    }

    const users = await this.repository.listUsersForTenant(tenant.tenantId);
    const target = users.find((u) => u.id === staffUserId);
    if (!target || target.tenantId !== tenant.tenantId) {
      throw new NotFoundException('Staff user not found');
    }

    target.roleId = role.id;
    const saved = await this.repository.saveUser(target);

    const membership = await this.repository.findMembership(tenant.tenantId, staffUserId);
    if (membership) {
      membership.roleId = role.id;
      await this.repository.saveMembership(membership);
    }

    return saved;
  }

  async setStaffActive(
    user: AuthenticatedUser,
    tenant: TenantContext,
    staffUserId: string,
    isActive: boolean,
  ): Promise<UserEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const users = await this.repository.listUsersForTenant(tenant.tenantId);
    const target = users.find((u) => u.id === staffUserId);
    if (!target) {
      throw new Error('Staff user not found');
    }

    target.status = isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    const saved = await this.repository.saveUser(target);

    const membership = await this.repository.findMembership(tenant.tenantId, staffUserId);
    if (membership) {
      membership.isActive = isActive;
      await this.repository.saveMembership(membership);
    }

    return saved;
  }

  async listInvitations(tenantId: string): Promise<StaffInvitationEntity[]> {
    return this.repository.listInvitations(tenantId);
  }
}
