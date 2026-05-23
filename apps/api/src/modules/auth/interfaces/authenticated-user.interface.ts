/**
 * Authenticated principal attached to the request after JWT validation.
 */
export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
  roleId: string;
  sessionId?: string;
  permissions: string[];
}
