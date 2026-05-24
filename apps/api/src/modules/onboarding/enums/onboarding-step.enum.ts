export enum OnboardingStep {
  STARTED = 'started',
  /** @deprecated Legacy wizard step — treated as catalog for ordering */
  MENU = 'menu',
  /** @deprecated Legacy wizard step */
  POS = 'pos',
  /** @deprecated Legacy wizard step */
  DELIVERY = 'delivery',
  BUSINESS = 'business',
  LOCATION = 'location',
  CATALOG = 'catalog',
  BRANDING = 'branding',
  PAYMENTS = 'payments',
  COMPLETED = 'completed',
}

/** Primary retail onboarding wizard (signup → dashboard). */
export const ONBOARDING_WIZARD_STEP_ORDER: OnboardingStep[] = [
  OnboardingStep.STARTED,
  OnboardingStep.BUSINESS,
  OnboardingStep.LOCATION,
  OnboardingStep.CATALOG,
  OnboardingStep.BRANDING,
  OnboardingStep.PAYMENTS,
  OnboardingStep.COMPLETED,
];

/** @deprecated Legacy step order — kept for existing records and old endpoints. */
export const ONBOARDING_STEP_ORDER: OnboardingStep[] = [
  OnboardingStep.STARTED,
  OnboardingStep.MENU,
  OnboardingStep.POS,
  OnboardingStep.DELIVERY,
  OnboardingStep.PAYMENTS,
  OnboardingStep.COMPLETED,
];

export function resolveOnboardingStepOrder(record: {
  completedSteps: OnboardingStep[];
  currentStep: OnboardingStep;
}): OnboardingStep[] {
  const usesLegacy = record.completedSteps.some(
    (step) =>
      step === OnboardingStep.MENU ||
      step === OnboardingStep.POS ||
      step === OnboardingStep.DELIVERY,
  );
  if (usesLegacy || record.currentStep === OnboardingStep.MENU) {
    return ONBOARDING_STEP_ORDER;
  }
  return ONBOARDING_WIZARD_STEP_ORDER;
}
