import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiSuccessResponse } from '../../../common/interfaces';
import { TenantGuard } from '../../../common/guards';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '../../auth';
import { API_KEY_SCOPE_CATALOG } from '../../auth/services/api-keys.service';
import { SUPPORTED_WEBHOOK_EVENTS } from '../services/webhooks.service';

const publicEndpoints = [
  { method: 'GET', path: '/api/v1/api/orders', scope: 'orders.read' },
  { method: 'GET', path: '/api/v1/api/orders/{id}', scope: 'orders.read' },
  { method: 'GET', path: '/api/v1/api/catalog', scope: 'catalog.read' },
  { method: 'GET', path: '/api/v1/api/items/{id}', scope: 'products.read' },
  { method: 'GET', path: '/api/v1/api/inventory', scope: 'inventory.read' },
  { method: 'GET', path: '/api/v1/api/customers', scope: 'customers.read' },
  { method: 'GET', path: '/api/v1/api/locations', scope: 'locations.read' },
];

@Controller('developer')
@UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
export class DeveloperPlatformController {
  @Get('openapi.json')
  @RequirePermissions('api-keys:read')
  openApi(): ApiSuccessResponse<Record<string, unknown>> {
    return {
      success: true,
      data: {
        openapi: '3.1.0',
        info: { title: 'Ordella Developer API', version: '1.0.0' },
        security: [{ bearerApiKey: [] }],
        components: {
          securitySchemes: {
            bearerApiKey: { type: 'http', scheme: 'bearer', bearerFormat: 'Ordella API key' },
          },
        },
        paths: Object.fromEntries(publicEndpoints.map((endpoint) => [
          endpoint.path,
          {
            [endpoint.method.toLowerCase()]: {
              summary: `${endpoint.method} ${endpoint.path}`,
              security: [{ bearerApiKey: [] }],
              'x-required-scope': endpoint.scope,
              responses: { 200: { description: 'Success' }, 401: { description: 'Invalid API key' }, 429: { description: 'Rate limit exceeded' } },
            },
          },
        ])),
        'x-ordella': {
          scopes: API_KEY_SCOPE_CATALOG,
          rateLimits: { defaultPerKeyPerMinute: 1000, headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'] },
          webhookEvents: SUPPORTED_WEBHOOK_EVENTS,
        },
      },
    };
  }

  @Get('docs')
  @RequirePermissions('api-keys:read')
  docs(): ApiSuccessResponse<Record<string, unknown>> {
    return {
      success: true,
      data: {
        authentication: 'Send Authorization: Bearer <api_key> or x-api-key. Keys are tenant-scoped, scoped, optionally IP-restricted, and rate-limited.',
        rateLimits: 'Default API key limit is 1000 requests per minute unless configured lower or higher for the key.',
        webhookSigning: 'Verify X-Ordella-Signature in the form t=<unix>,v1=<hmac_sha256(timestamp + "." + rawBody)> using the webhook secret.',
        examples: {
          javascript: "await fetch('https://api.ordella.local/api/v1/api/orders', { headers: { Authorization: `Bearer ${process.env.ORDELLA_API_KEY}` } })",
          python: "requests.get('https://api.ordella.local/api/v1/api/orders', headers={'Authorization': f'Bearer {api_key}'})",
          php: "$client->request('GET', '/api/v1/api/orders', ['headers' => ['Authorization' => 'Bearer '.$apiKey]]);",
        },
        endpoints: publicEndpoints,
      },
    };
  }
}
