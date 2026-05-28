'use client';

import { useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { labelOrderChannel, labelOrderStatus, ORDER_CHANNEL_LABELS, ORDER_STATUS_LABELS } from '@shared-utils';
import {
  DateRangePicker,
  FilterActions,
  FilterApplyButton,
  FilterBar,
  FilterGroup,
  FilterItem,
  FilterResetButton,
  FilterSelect,
  paramsFromForm,
  useFilterReset,
} from '@/components/ui/admin-filter';

const STATUS_VALUES = Object.keys(ORDER_STATUS_LABELS);
const CHANNEL_VALUES = Object.keys(ORDER_CHANNEL_LABELS);

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reset = useFilterReset();
  const statusId = useId();
  const channelId = useId();

  const status = searchParams.get('status') ?? '';
  const channel = searchParams.get('channel') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = paramsFromForm(e.currentTarget, ['status', 'channel', 'from', 'to']);
    router.push(`?${params.toString()}`);
  }

  return (
    <FilterBar className="mb-4" onSubmit={onSubmit}>
      <FilterGroup columns={2}>
        <FilterItem label="Status" htmlFor={statusId} active={Boolean(status)}>
          <FilterSelect id={statusId} name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {labelOrderStatus(s)}
              </option>
            ))}
          </FilterSelect>
        </FilterItem>
        <FilterItem label="Channel" htmlFor={channelId} active={Boolean(channel)}>
          <FilterSelect id={channelId} name="channel" defaultValue={channel}>
            <option value="">All channels</option>
            {CHANNEL_VALUES.map((c) => (
              <option key={c} value={c}>
                {labelOrderChannel(c)}
              </option>
            ))}
          </FilterSelect>
        </FilterItem>
      </FilterGroup>
      <DateRangePicker
        fromId="orders-from"
        toId="orders-to"
        fromDefaultValue={from}
        toDefaultValue={to}
        fromActive={Boolean(from)}
        toActive={Boolean(to)}
      />
      <FilterActions>
        <FilterApplyButton>Apply</FilterApplyButton>
        <FilterResetButton type="button" onClick={reset}>
          Clear
        </FilterResetButton>
      </FilterActions>
    </FilterBar>
  );
}
