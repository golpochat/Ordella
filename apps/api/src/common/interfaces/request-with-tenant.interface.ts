import { Request } from 'express';
import { TenantContext } from './tenant-context.interface';
import { TENANT_CONTEXT_KEY } from '../constants/tenant-context-key';
import { CURRENT_USER_KEY } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';

export interface RequestWithTenant extends Request {
  [TENANT_CONTEXT_KEY]?: TenantContext;
  [CURRENT_USER_KEY]?: AuthenticatedUser;
}
