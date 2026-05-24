import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export function throwAdminResourceNotFound(resource: string, id: string): never {
  throw new NotFoundException(`Admin ${resource} not found: ${id}`);
}

export function throwAdminCrossTenant(resource: string): never {
  throw new ForbiddenException(`${resource} does not belong to this tenant`);
}

export function throwAdminUnsafeProductUpdate(productId: string): never {
  throw new BadRequestException(
    `Cannot modify product ${productId} while it appears on open orders`,
  );
}

export function throwAdminUnsafeOrderTransition(from: string, to: string): never {
  throw new BadRequestException(`Admin cannot transition order from ${from} to ${to}`);
}

export function throwAdminOrderTerminal(status: string): never {
  throw new BadRequestException(`Order is in terminal status: ${status}`);
}
