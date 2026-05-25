import { createBrowserApiClient } from '../browser';

export type RoutingRule = {
  id: string;
  ruleType: 'distance' | 'stock' | 'capacity' | 'priority' | 'delivery_zone';
  value: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
};

export type RoutingDecision = {
  id: string;
  orderId: string | null;
  fromLocationId: string | null;
  toLocationId: string | null;
  reason: string;
  estimatedDeliveryMinutes: number | null;
  fallbackOptions: Array<Record<string, unknown>>;
  createdAt: string;
  toLocation?: { id: string; name: string } | null;
};

export async function fetchRoutingRules(): Promise<RoutingRule[]> {
  const api = createBrowserApiClient();
  return api.getData<RoutingRule[]>('routing/rules');
}

export async function fetchRoutingDecisions(): Promise<RoutingDecision[]> {
  const api = createBrowserApiClient();
  return api.getData<RoutingDecision[]>('routing/decisions');
}

export async function saveRoutingRule(body: {
  id?: string;
  ruleType: RoutingRule['ruleType'];
  value: Record<string, unknown>;
  isActive?: boolean;
}): Promise<RoutingRule> {
  const api = createBrowserApiClient();
  return api.postData<RoutingRule>(body.id ? 'routing/rules/update' : 'routing/rules/create', body);
}
