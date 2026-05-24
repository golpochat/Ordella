/**
 * Public auth module surface for cross-domain imports.
 * Import guards/decorators from here — not from internal paths.
 */
export * from './guards';
export * from './decorators';
export * from './constants';
export type { AuthenticatedUser } from './interfaces';
