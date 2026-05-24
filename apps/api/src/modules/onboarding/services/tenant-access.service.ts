import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { throwAdminRequired, throwCrossTenantAccess } from '../domain/onboarding.errors';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { SystemRoleNames } from '../constants/system-roles';

@Injectable()
export class TenantAccessService {
  constructor(private readonly repository: OnboardingRepository) {}

  assertTenantAccess(user: AuthenticatedUser, tenant: TenantContext): void {
    if (user.tenantId !== tenant.tenantId) {
      throwCrossTenantAccess();
    }
  }

  async assertAdmin(user: AuthenticatedUser, tenant: TenantContext): Promise<void> {
    this.assertTenantAccess(user, tenant);
    const role = await this.repository.findRoleByName(tenant.tenantId, SystemRoleNames.ADMIN);
    if (!role || user.roleId !== role.id) {
      throwAdminRequired();
    }
  }

  async assertMembership(user: AuthenticatedUser, tenantId: string): Promise<void> {
    const membership = await this.repository.findMembership(tenantId, user.id);
    if (!membership?.isActive) {
      throwCrossTenantAccess();
    }
  }
}
