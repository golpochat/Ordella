/**
 * Resolved tenant context for the current request.
 * Populated by tenant middleware from subdomain, API key, or JWT.
 */
export interface TenantContext {
  tenantId: string;
  /** How the tenant was resolved */
  source: 'subdomain' | 'custom' | 'api_key' | 'jwt' | 'header';
}
