import { SetMetadata } from '@nestjs/common';

export const API_KEY_SCOPES_KEY = 'apiKeyScopes';

export const RequireApiKeyScopes = (...scopes: string[]) => SetMetadata(API_KEY_SCOPES_KEY, scopes);
