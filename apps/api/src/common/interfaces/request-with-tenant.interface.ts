import { Request } from 'express';
import { TenantContext } from './tenant-context.interface';
import { TenantLocalizationSettings } from './tenant-settings.interface';
import { TENANT_CONTEXT_KEY } from '../constants/tenant-context-key';
import { TENANT_SETTINGS_KEY } from '../constants/tenant-settings-key';
import { CURRENT_USER_KEY } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from './authenticated-user.interface';

export interface RequestWithTenant extends Request {
  [TENANT_CONTEXT_KEY]?: TenantContext;
  [TENANT_SETTINGS_KEY]?: TenantLocalizationSettings;
  [CURRENT_USER_KEY]?: AuthenticatedUser;
}
