import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserStatus } from '../../auth/enums/user-status.enum';
import { TenantStatus } from '../../tenants/enums/tenant-status.enum';
import { LocationStatus } from '../../tenants/enums/location-status.enum';
import { LocationOpeningHoursEntity } from '../../tenants/entities/location-opening-hours.entity';
import { SubscriptionPlan } from '../enums/subscription-plan.enum';
import { OnboardingStep } from '../enums/onboarding-step.enum';
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_TENANT_ROLE_NAMES,
  ROLE_PERMISSION_MAP,
  SystemRoleNames,
} from '../../../common/rbac/role-permissions';
import { throwTenantSlugTaken } from '../domain/onboarding.errors';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { hashPassword } from '../utils/password.util';
import { slugifyTenantName } from '../utils/slug.util';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_LOCATION_NAME,
  DEFAULT_TIMEZONE,
  defaultLocationSettings,
  defaultOpeningHoursRows,
  defaultOpeningHoursTemplate,
  defaultTenantMetadata,
} from '../constants/default-provisioning';

export type TenantSignupResult = {
  tenantId: string;
  tenantName: string;
  slug: string;
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  onboardingComplete: boolean;
};

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
          currency: DEFAULT_CURRENCY,
          locale: DEFAULT_LOCALE,
          openingHours: defaultOpeningHoursTemplate(),
          metadata: defaultTenantMetadata(),
        },
        manager,
      );

      await this.repository.saveBranding(
        {
          tenantId: tenant.id,
          logoUrl: null,
          theme: {
            preset: 'light',
            colors: {
              primary: '#0f766e',
              secondary: '#ccfbf1',
              background: '#ffffff',
              surface: '#f0fdfa',
            },
            typography: { sm: '0.875rem', md: '1rem', lg: '1.125rem' },
            iconUrl: null,
          },
          businessInfo: {
            businessName: '',
            businessType: null,
            receiptHeader: '',
            receiptFooter: '',
          },
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
          currentStep: OnboardingStep.BUSINESS,
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
      for (const roleName of DEFAULT_TENANT_ROLE_NAMES) {
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

      const ownerRoleId = roleIds.get(SystemRoleNames.OWNER);
      if (!ownerRoleId) {
        throw new Error('Owner role was not created');
      }

      const passwordHash = await hashPassword(password);
      const ownerUser = await this.repository.saveUser(
        {
          tenantId: tenant.id,
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          roleId: ownerRoleId,
          status: UserStatus.ACTIVE,
          mfaEnabled: false,
        },
        manager,
      );

      await this.repository.saveMembership(
        {
          tenantId: tenant.id,
          userId: ownerUser.id,
          roleId: ownerRoleId,
          isActive: true,
        },
        manager,
      );

      const location = await this.repository.saveLocation(
        {
          tenantId: tenant.id,
          name: DEFAULT_LOCATION_NAME,
          address: null,
          timezone: DEFAULT_TIMEZONE,
          status: LocationStatus.CLOSED,
        },
        manager,
      );

      await this.repository.saveLocationSettings(
        {
          locationId: location.id,
          settings: defaultLocationSettings(),
        },
        manager,
      );

      const hoursRepo = manager.getRepository(LocationOpeningHoursEntity);
      await hoursRepo.save(
        defaultOpeningHoursRows().map((row) =>
          hoursRepo.create({
            locationId: location.id,
            ...row,
          }),
        ),
      );

      this.sendVerificationEmailPlaceholder(normalizedEmail, tenant.id);

      const permissions = ['*'];
      const accessToken = await this.jwtService.signAsync({
        sub: ownerUser.id,
        tenantId: tenant.id,
        email: ownerUser.email,
        roleId: ownerRoleId,
        roleName: SystemRoleNames.OWNER,
        permissions,
      });
      const refreshToken = await this.jwtService.signAsync(
        { sub: ownerUser.id, tenantId: tenant.id, type: 'refresh' },
        { expiresIn: '7d' },
      );

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        slug,
        userId: ownerUser.id,
        email: ownerUser.email,
        accessToken,
        refreshToken,
        onboardingComplete: false,
      };
    });
  }

  private sendVerificationEmailPlaceholder(email: string, tenantId: string): void {
    this.logger.log(`[placeholder] verification email to=${email} tenant=${tenantId}`);
  }
}
