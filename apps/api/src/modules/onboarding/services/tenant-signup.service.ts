import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { TenantStatus } from '../../tenants/enums/tenant-status.enum';
import { LocationStatus } from '../../tenants/enums/location-status.enum';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { OnboardingStep } from '../enums/onboarding-step.enum';
import {
  ALL_PERMISSION_KEYS,
  ROLE_PERMISSION_MAP,
  SystemRoleNames,
} from '../../../common/rbac/role-permissions';
import { throwTenantSlugTaken } from '../domain/onboarding.errors';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { hashPassword } from '../utils/password.util';
import { slugifyTenantName } from '../utils/slug.util';

export type TenantSignupResult = {
  tenantId: string;
  tenantName: string;
  slug: string;
  userId: string;
  email: string;
  accessToken: string;
};

function defaultOpeningHours(): Record<string, unknown> {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return Object.fromEntries(
    days.map((day) => [day, { open: '09:00', close: '21:00', isClosed: day === 'sunday' }]),
  );
}

@Injectable()
export class TenantSignupService {
  private readonly logger = new Logger(TenantSignupService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly repository: OnboardingRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createTenant(name: string, email: string, password: string): Promise<TenantSignupResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const slug = slugifyTenantName(name);

    return this.dataSource.transaction(async (manager) => {
      const existingSlug = await this.repository.findTenantBySlug(slug, manager);
      if (existingSlug) {
        throwTenantSlugTaken(slug);
      }

      const tenant = await this.repository.saveTenant(
        {
          name: name.trim(),
          status: TenantStatus.ACTIVE,
          slug,
          subdomain: slug,
        },
        manager,
      );

      await this.repository.saveSettings(
        {
          tenantId: tenant.id,
          currency: 'USD',
          locale: 'en-US',
          openingHours: defaultOpeningHours(),
          metadata: {},
        },
        manager,
      );

      await this.repository.saveBranding(
        {
          tenantId: tenant.id,
          logoUrl: null,
          theme: { primary: '#0f766e', secondary: '#134e4a' },
          businessInfo: {},
        },
        manager,
      );

      await this.repository.saveBilling(
        {
          tenantId: tenant.id,
          plan: SubscriptionPlan.FREE,
          billingEmail: normalizedEmail,
          paymentMethod: { provider: 'placeholder', status: 'not_configured' },
        },
        manager,
      );

      await this.repository.saveOnboarding(
        {
          tenantId: tenant.id,
          currentStep: OnboardingStep.STARTED,
          completedSteps: [OnboardingStep.STARTED],
          isComplete: false,
        },
        manager,
      );

      const permissionIds = new Map<string, string>();
      for (const key of ALL_PERMISSION_KEYS) {
        const permission = await this.repository.ensurePermission(key, manager);
        permissionIds.set(key, permission.id);
      }

      const roleIds = new Map<string, string>();
      for (const roleName of Object.values(SystemRoleNames)) {
        const role = await this.repository.saveRole(
          {
            tenantId: tenant.id,
            name: roleName,
            description: `Default ${roleName} role`,
          },
          manager,
        );
        roleIds.set(roleName, role.id);

        const keys = ROLE_PERMISSION_MAP[roleName] ?? [];
        for (const key of keys) {
          if (key === '*') {
            for (const permKey of ALL_PERMISSION_KEYS) {
              const permissionId = permissionIds.get(permKey);
              if (permissionId) {
                await this.repository.assignPermission(role.id, permissionId, manager);
              }
            }
            break;
          }
          const permissionId = permissionIds.get(key);
          if (permissionId) {
            await this.repository.assignPermission(role.id, permissionId, manager);
          }
        }
      }

      const adminRoleId = roleIds.get(SystemRoleNames.ADMIN);
      if (!adminRoleId) {
        throw new Error('Admin role was not created');
      }

      const passwordHash = await hashPassword(password);
      const adminUser = await this.repository.saveUser(
        {
          tenantId: tenant.id,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          roleId: adminRoleId,
          status: UserStatus.ACTIVE,
          mfaEnabled: false,
        },
        manager,
      );

      await this.repository.saveMembership(
        {
          tenantId: tenant.id,
          userId: adminUser.id,
          roleId: adminRoleId,
          isActive: true,
        },
        manager,
      );

      const location = await this.repository.saveLocation(
        {
          tenantId: tenant.id,
          name: `${name.trim()} — Main`,
          address: null,
          timezone: 'UTC',
          status: LocationStatus.CLOSED,
        },
        manager,
      );

      await this.repository.saveLocationSettings(
        {
          locationId: location.id,
          settings: { currency: 'USD', locale: 'en-US' },
        },
        manager,
      );

      this.sendVerificationEmailPlaceholder(normalizedEmail, tenant.id);

      const permissions = ['*'];
      const accessToken = await this.jwtService.signAsync({
        sub: adminUser.id,
        tenantId: tenant.id,
        email: adminUser.email,
        roleId: adminRoleId,
        roleName: SystemRoleNames.ADMIN,
        permissions,
      });

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug,
        userId: adminUser.id,
        email: adminUser.email,
        accessToken,
      };
    });
  }

  private sendVerificationEmailPlaceholder(email: string, tenantId: string): void {
    this.logger.log(`[placeholder] verification email to=${email} tenant=${tenantId}`);
  }
}
