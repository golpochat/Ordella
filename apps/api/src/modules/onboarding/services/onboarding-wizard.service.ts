import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import {
  ONBOARDING_WIZARD_STEP_ORDER,
  OnboardingStep,
  resolveOnboardingStepOrder,
} from '../enums/onboarding-step.enum';
import {
  throwOnboardingNotFound,
  throwOnboardingStepOutOfOrder,
} from '../domain/onboarding.errors';
import { OnboardingRepository } from '../repositories/onboarding.repositories';
import { TenantAccessService } from './tenant-access.service';
import { TenantOnboardingEntity } from '../entities';

@Injectable()
export class OnboardingWizardService {
  constructor(
    private readonly repository: OnboardingRepository,
    private readonly tenantAccess: TenantAccessService,
  ) {}

  async start(user: AuthenticatedUser, tenant: TenantContext): Promise<TenantOnboardingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const record = await this.requireOnboarding(tenant.tenantId);
    const order = resolveOnboardingStepOrder(record);
    const firstStep = order[1] ?? OnboardingStep.BUSINESS;

    if (!record.completedSteps.includes(OnboardingStep.STARTED)) {
      record.completedSteps = [...record.completedSteps, OnboardingStep.STARTED];
    }
    if (record.currentStep === OnboardingStep.STARTED) {
      record.currentStep = firstStep;
      return this.repository.saveOnboarding(record);
    }
    return record;
  }

  async completeStep(
    user: AuthenticatedUser,
    tenant: TenantContext,
    step: OnboardingStep,
  ): Promise<TenantOnboardingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const record = await this.requireOnboarding(tenant.tenantId);
    const order = resolveOnboardingStepOrder(record);
    this.assertStepOrder(record, step, order);

    if (!record.completedSteps.includes(step)) {
      record.completedSteps = [...record.completedSteps, step];
    }

    const stepIndex = order.indexOf(step);
    const next = order[stepIndex + 1];
    record.currentStep = next ?? OnboardingStep.COMPLETED;

    if (step === OnboardingStep.PAYMENTS) {
      record.isComplete = true;
      record.completedAt = new Date();
      if (!record.completedSteps.includes(OnboardingStep.COMPLETED)) {
        record.completedSteps = [...record.completedSteps, OnboardingStep.COMPLETED];
      }
      record.currentStep = OnboardingStep.COMPLETED;
    }

    return this.repository.saveOnboarding(record);
  }

  async getProgress(tenantId: string): Promise<TenantOnboardingEntity> {
    return this.requireOnboarding(tenantId);
  }

  async finalize(
    user: AuthenticatedUser,
    tenant: TenantContext,
  ): Promise<TenantOnboardingEntity> {
    await this.tenantAccess.assertAdmin(user, tenant);
    const record = await this.requireOnboarding(tenant.tenantId);
    const order = resolveOnboardingStepOrder(record);
    const brandingStep = order.includes(OnboardingStep.BRANDING)
      ? OnboardingStep.BRANDING
      : OnboardingStep.DELIVERY;

    if (!record.completedSteps.includes(brandingStep)) {
      throwOnboardingStepOutOfOrder(brandingStep, OnboardingStep.COMPLETED);
    }

    record.isComplete = true;
    record.completedAt = new Date();
    record.currentStep = OnboardingStep.COMPLETED;
    if (!record.completedSteps.includes(OnboardingStep.COMPLETED)) {
      record.completedSteps = [...record.completedSteps, OnboardingStep.COMPLETED];
    }

    return this.repository.saveOnboarding(record);
  }

  private async requireOnboarding(tenantId: string): Promise<TenantOnboardingEntity> {
    const record = await this.repository.findOnboarding(tenantId);
    if (record) {
      return record;
    }

    const tenant = await this.repository.findTenantById(tenantId);
    if (!tenant) {
      throwOnboardingNotFound(tenantId);
    }

    return this.repository.saveOnboarding({
      tenantId,
      currentStep: OnboardingStep.COMPLETED,
      completedSteps: ONBOARDING_WIZARD_STEP_ORDER,
      isComplete: true,
      completedAt: new Date(),
    });
  }

  private assertStepOrder(
    record: TenantOnboardingEntity,
    step: OnboardingStep,
    order: OnboardingStep[],
  ): void {
    const stepIndex = order.indexOf(step);
    if (stepIndex <= 0) {
      return;
    }

    const previous = order[stepIndex - 1];
    if (!record.completedSteps.includes(previous)) {
      throwOnboardingStepOutOfOrder(previous, step);
    }
  }
}
