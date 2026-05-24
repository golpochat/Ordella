import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from '../../../common/interfaces';
import { resolveRolePermissions } from '../constants/rbac-permissions';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { throwCrossTenantAccess } from '../domain/onboarding.errors';

export type TenantMembershipView = {
  tenantId: string;
  tenantName: string;
  slug: string | null;
  roleId: string;
  roleName: string;
  isActive: boolean;
};

@Injectable()
export class TenantSwitcherService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly jwtService: JwtService,
  ) {}

  async listTenantsForUser(user: AuthenticatedUser): Promise<TenantMembershipView[]> {
    const accounts = await this.repository.findUsersByEmail(user.email);
    const views: TenantMembershipView[] = [];

    for (const account of accounts) {
      const tenant = await this.repository.findTenantById(account.tenantId);
      if (!tenant) continue;
      views.push({
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug: tenant.slug,
        roleId: account.roleId,
        roleName: account.role?.name ?? 'unknown',
        isActive: account.status === 'active',
      });
    }

    return views;
  }

  async switchTenant(
    user: AuthenticatedUser,
    tenantId: string,
  ): Promise<{ accessToken: string; tenantId: string; roleName: string }> {
    const account = await this.repository.findUserByEmail(tenantId, user.email);
    if (!account || account.status !== 'active') {
      throwCrossTenantAccess();
    }

    const assigned = await this.repository.getRolePermissions(account.roleId);
    const roleName = account.role?.name ?? 'unknown';
    const permissions = resolveRolePermissions(roleName, assigned);

    const accessToken = await this.jwtService.signAsync({
      sub: account.id,
      tenantId,
      email: account.email,
      roleId: account.roleId,
      roleName,
      permissions,
    });

    return { accessToken, tenantId, roleName };
  }
}
