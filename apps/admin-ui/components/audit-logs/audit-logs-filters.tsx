'use client';

import { useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterGroup,
  FilterInput,
  FilterItem,
  FilterResetButton,
  FilterSelect,
  paramsFromForm,
  useFilterReset,
} from '@/components/ui/admin-filter';

const ENTITY_TYPES = [
  'order',
  'inventory',
  'product',
  'category',
  'user',
  'role',
  'customer',
  'location',
  'payment',
  'gift_card',
  'store_credit',
  'billing',
  'support',
  'subscription',
  'promotion',
  'delivery',
  'marketing',
  'auth',
  'webhook',
];

const FILTER_KEYS = [
  'from',
  'to',
  'userId',
  'locationId',
  'entityType',
  'action',
  'actorType',
  'source',
  'status',
  'riskLevel',
] as const;

export function AuditLogsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useFilterReset();
  const entityTypeId = useId();
  const actorTypeId = useId();
  const statusId = useId();
  const riskLevelId = useId();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = paramsFromForm(event.currentTarget, [...FILTER_KEYS]);
    router.push(`?${params.toString()}`);
  }

  return (
    <FilterBar className="mb-4" onSubmit={onSubmit}>
      <FilterGroup columns={6}>
        <FilterItem label="From" htmlFor="audit-from" active={Boolean(searchParams.get('from'))}>
          <FilterInput id="audit-from" name="from" type="date" defaultValue={searchParams.get('from') ?? ''} />
        </FilterItem>
        <FilterItem label="To" htmlFor="audit-to" active={Boolean(searchParams.get('to'))}>
          <FilterInput id="audit-to" name="to" type="date" defaultValue={searchParams.get('to') ?? ''} />
        </FilterItem>
        <FilterItem label="User ID" htmlFor="audit-user" active={Boolean(searchParams.get('userId'))}>
          <FilterInput
            id="audit-user"
            name="userId"
            placeholder="Staff or customer ID"
            defaultValue={searchParams.get('userId') ?? ''}
          />
        </FilterItem>
        <FilterItem label="Location ID" htmlFor="audit-location" active={Boolean(searchParams.get('locationId'))}>
          <FilterInput
            id="audit-location"
            name="locationId"
            placeholder="Location ID"
            defaultValue={searchParams.get('locationId') ?? ''}
          />
        </FilterItem>
        <FilterItem label="Entity type" htmlFor={entityTypeId} active={Boolean(searchParams.get('entityType'))}>
          <FilterSelect id={entityTypeId} name="entityType" defaultValue={searchParams.get('entityType') ?? ''}>
            <option value="">All entity types</option>
            {ENTITY_TYPES.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType.replaceAll('_', ' ')}
              </option>
            ))}
          </FilterSelect>
        </FilterItem>
        <FilterItem label="Action" htmlFor="audit-action" active={Boolean(searchParams.get('action'))}>
          <FilterInput
            id="audit-action"
            name="action"
            placeholder="Action"
            defaultValue={searchParams.get('action') ?? ''}
          />
        </FilterItem>
        <FilterItem label="Actor" htmlFor={actorTypeId} active={Boolean(searchParams.get('actorType'))}>
          <FilterSelect id={actorTypeId} name="actorType" defaultValue={searchParams.get('actorType') ?? ''}>
            <option value="">All actors</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
            <option value="system">System</option>
          </FilterSelect>
        </FilterItem>
        <FilterItem label="Outcome" htmlFor={statusId} active={Boolean(searchParams.get('status'))}>
          <FilterSelect id={statusId} name="status" defaultValue={searchParams.get('status') ?? ''}>
            <option value="">All outcomes</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </FilterSelect>
        </FilterItem>
        <FilterItem label="Risk level" htmlFor={riskLevelId} active={Boolean(searchParams.get('riskLevel'))}>
          <FilterSelect id={riskLevelId} name="riskLevel" defaultValue={searchParams.get('riskLevel') ?? ''}>
            <option value="">All risk levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </FilterSelect>
        </FilterItem>
        <FilterItem label="Source" htmlFor="audit-source" active={Boolean(searchParams.get('source'))}>
          <FilterInput
            id="audit-source"
            name="source"
            placeholder="Source"
            defaultValue={searchParams.get('source') ?? ''}
          />
        </FilterItem>
      </FilterGroup>
      <FilterActions>
        <FilterApplyButton>Apply</FilterApplyButton>
        <FilterResetButton type="button" onClick={reset}>
          Clear
        </FilterResetButton>
      </FilterActions>
    </FilterBar>
  );
}
