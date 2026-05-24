export enum OnboardingStep {
  STARTED = 'started',
  MENU = 'menu',
  POS = 'pos',
  DELIVERY = 'delivery',
  PAYMENTS = 'payments',
  COMPLETED = 'completed',
}

export const ONBOARDING_STEP_ORDER: OnboardingStep[] = [
  OnboardingStep.STARTED,
  OnboardingStep.MENU,
  OnboardingStep.POS,
  OnboardingStep.DELIVERY,
  OnboardingStep.PAYMENTS,
  OnboardingStep.COMPLETED,
];
