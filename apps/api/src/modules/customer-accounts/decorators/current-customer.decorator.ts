import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomerAuthPayload } from '../types/customer-auth-payload';

export const CUSTOMER_AUTH_KEY = 'customerAuth';

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CustomerAuthPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<{ [CUSTOMER_AUTH_KEY]?: CustomerAuthPayload }>();
    return request[CUSTOMER_AUTH_KEY];
  },
);
