import { Injectable } from '@nestjs/common';
import { AuthenticatedUser, TenantContext } from '../../../common/interfaces';
import { OnboardingStep, ONBOARDING_STEP_ORDER } from '../enums/onboarding-step.enum';
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
    if (!record.completedSteps.includes(OnboardingStep.STARTED)) {
      record.completedSteps = [...record.completedSteps, OnboardingStep.STARTED];
      record.currentStep = OnboardingStep.MENU;
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
    this.assertStepOrder(record, step);

    if (!record.completedSteps.includes(step)) {
      record.completedSteps = [...record.completedSteps, step];
    }

    const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step);
    const next = ONBOARDING_STEP_ORDER[stepIndex + 1];
    record.currentStep = next ?? OnboardingStep.COMPLETED;

    if (step === OnboardingStep.PAYMENTS && next === OnboardingStep.COMPLETED) {
      record.isComplete = true;
      record.completedAt = new Date();
      record.completedSteps = [...record.completedSteps, OnboardingStep.COMPLETED];
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

    if (!record.completedSteps.includes(OnboardingStep.PAYMENTS)) {
      throwOnboardingStepOutOfOrder(OnboardingStep.PAYMENTS, OnboardingStep.COMPLETED);
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
    if (!record) {
      throwOnboardingNotFound(tenantId);
    }
    return record;
  }

  private assertStepOrder(record: TenantOnboardingEntity, step: OnboardingStep): void {
    const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step);
    if (stepIndex <= 0) {
      return;
    }

    const previous = ONBOARDING_STEP_ORDER[stepIndex - 1];
    if (!record.completedSteps.includes(previous)) {
      throwOnboardingStepOutOfOrder(previous, step);
    }
  }
}
