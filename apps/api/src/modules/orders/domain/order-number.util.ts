import { randomBytes } from 'crypto';

export function generateOrderNumber(): string {
  const suffix = randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${Date.now().toString(36).toUpperCase()}-${suffix}`;
}
