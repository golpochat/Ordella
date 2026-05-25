import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupplierAuthPayload } from '../types/supplier-auth-payload';

export const SUPPLIER_AUTH_KEY = 'supplierAuth';

export const CurrentSupplier = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupplierAuthPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [SUPPLIER_AUTH_KEY]?: SupplierAuthPayload }>();
    return request[SUPPLIER_AUTH_KEY];
  },
);
