import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export function throwCrossTenantAccess(): never {
  throw new ForbiddenException({
    code: 'CROSS_TENANT_ACCESS',
    message: 'Access denied for this tenant',
  });
}

export function throwAdminRequired(): never {
  throw new ForbiddenException({
    code: 'ADMIN_REQUIRED',
    message: 'Only tenant administrators can perform this action',
  });
}

export function throwOnboardingStepOutOfOrder(expected: string, attempted: string): never {
  throw new BadRequestException({
    code: 'ONBOARDING_STEP_OUT_OF_ORDER',
    message: `Complete step "${expected}" before "${attempted}"`,
  });
}

export function throwOnboardingNotFound(tenantId: string): never {
  throw new NotFoundException({
    code: 'ONBOARDING_NOT_FOUND',
    message: `Onboarding record not found for tenant ${tenantId}`,
  });
}

export function throwTenantSlugTaken(slug: string): never {
  throw new BadRequestException({
    code: 'TENANT_SLUG_TAKEN',
    message: `Tenant slug "${slug}" is already in use`,
  });
}
