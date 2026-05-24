import { EntityManager } from 'typeorm';

export interface OrderTransitionContext {
  changedBy?: string | null;
  reason?: string | null;
  manager?: EntityManager;
}
