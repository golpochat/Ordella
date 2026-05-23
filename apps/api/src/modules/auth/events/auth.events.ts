/** Domain events published by the auth service (placeholder). */
export const AuthEvents = {
  USER_LOGGED_IN: 'auth.user.logged_in',
  USER_LOGGED_OUT: 'auth.user.logged_out',
  SESSION_REVOKED: 'auth.session.revoked',
  MFA_VERIFIED: 'auth.mfa.verified',
  API_KEY_CREATED: 'auth.api_key.created',
  API_KEY_REVOKED: 'auth.api_key.revoked',
} as const;

export type AuthEventName = (typeof AuthEvents)[keyof typeof AuthEvents];
