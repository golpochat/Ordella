import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant-context.interface';
import { TENANT_CONTEXT_KEY } from '../constants/tenant-context-key';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [TENANT_CONTEXT_KEY]?: TenantContext }>();
    return request[TENANT_CONTEXT_KEY];
  },
);
