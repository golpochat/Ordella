'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useId, useState } from 'react';
import { Button, Input } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { refreshCrmInsights, updateCrmCustomerTags, type CrmCustomerDetail } from '@/lib/api/admin/crm';
import {
  DetailField,
  DetailMetric,
  DetailMetrics,
  DetailSectionCard,
  DetailStatusBadge,
  DetailTwoColumn,
  Stack,
} from '@/components/ui/admin-detail';
import { Tag, TagGroup, TagLabel } from '@/components/ui/admin-tag';
import { FormActions, FormField, Textarea } from '@/components/ui/admin-form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { formatDate, formatMoney, getErrorMessage } from '@/lib/utils';
import { PanelEmpty } from '@/components/ui/admin-empty-state';

function field(row: unknown, key: string): string | number | boolean | null {
  if (!row || typeof row !== 'object') return null;
  const value = (row as Record<string, unknown>)[key];
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : null;
}

export function CrmCustomerProfilePanel({ initialCustomer }: { initialCustomer: CrmCustomerDetail }) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const tagsId = useId();
  const notesId = useId();
  const [customer, setCustomer] = useState(initialCustomer);
  const [tagInput, setTagInput] = useState(customer.tags.join(', '));
  const [notes, setNotes] = useState(customer.staffNotes ?? '');
  
  async function saveTags() {
    try {
      const updated = await updateCrmCustomerTags(createBrowserApiClient(), {
        customerId: customer.id,
        tags: tagInput.split(',').map((tag) => tag.trim()).filter(Boolean),
        notes,
      });
      setCustomer((current) => ({ ...current, ...updated }));
      toastSuccess('Customer CRM profile updated.');
    } catch (error) {
      toastError(getErrorMessage(error));
    }
  }

  async function refresh() {
    try {
      await refreshCrmInsights(createBrowserApiClient(), customer.id);
      toastSuccess('Insights updated. Refresh the page to see new generated segments and categories.');
    } catch (error) {
      toastError(getErrorMessage(error));
    }
  }

  const accountStatus = customer.accountStatus ?? (customer.lastLoginAt ? 'registered' : 'guest');

  return (
    <Stack gap="lg">
      <DetailMetrics>
        <DetailMetric label="Lifetime value" value={formatMoney(customer.lifetimeValue)} />
        <DetailMetric label="Total orders" value={customer.totalOrders} />
        <DetailMetric label="Average order" value={formatMoney(customer.avgOrderValue)} />
        <DetailMetric label="Last order" value={formatDate(customer.lastOrderAt ?? undefined)} />
      </DetailMetrics>

      <DetailMetrics>
        <DetailMetric label="Loyalty points" value={customer.pointsBalance} />
        <DetailMetric label="Store credit" value={formatMoney(customer.storeCreditBalance)} />
        <DetailMetric label="Frequency" value={customer.insight?.orderFrequency ?? 'Unknown'} />
        <DetailMetric label="Churn risk" value={customer.insight?.churnRiskScore ?? 'N/A'} />
      </DetailMetrics>

      <DetailMetrics columns={4}>
        <DetailMetric label="Account status" value={<DetailStatusBadge status={accountStatus} />} />
        <DetailMetric label="Last login" value={formatDate(customer.lastLoginAt ?? undefined)} />
        <DetailMetric label="Email verified" value={customer.emailVerifiedAt ? 'Yes' : 'No'} />
        <DetailMetric label="Date of birth" value={customer.dateOfBirth ?? 'Not set'} />
      </DetailMetrics>

      <DetailTwoColumn
        primary={
          <DetailSectionCard title="Contact" description="Email, phone, and preferred location.">
            <Stack gap="sm">
              <DetailField label="Email" value={customer.email ?? 'No email'} />
              <DetailField label="Phone" value={customer.phone ?? 'No phone'} />
              <DetailField label="Gender" value={customer.gender ?? 'Not set'} />
              <DetailField label="Preferred location" value={customer.preferredLocationId ?? 'Unknown'} />
            </Stack>
          </DetailSectionCard>
        }
        secondary={
          <DetailSectionCard title="Segments" description="Generated and manual segments.">
            <TagGroup>
              {customer.segments.map((segment) => (
                <Tag key={segment} variant="info">
                  <TagLabel>{segment}</TagLabel>
                </Tag>
              ))}
              {!customer.segments.length ? (
                <PanelEmpty title="No generated segments yet" description="Content will appear here when available." />
              ) : null}
            </TagGroup>
          </DetailSectionCard>
        }
      />

      <DetailTwoColumn
        primary={
          <DetailSectionCard title="Communication preferences">
            <Stack gap="sm">
              <DetailField label="Email" value={customer.notificationEmailOptIn ? 'Enabled' : 'Disabled'} />
              <DetailField label="SMS" value={customer.notificationSmsOptIn ? 'Enabled' : 'Disabled'} />
              <DetailField label="Push" value={customer.notificationPushOptIn ? 'Enabled' : 'Disabled'} />
            </Stack>
          </DetailSectionCard>
        }
        secondary={
          <DetailSectionCard title="Marketing preferences">
            <Stack gap="sm">
              <DetailField label="Email" value={customer.marketingEmailOptIn ? 'Opted in' : 'Opted out'} />
              <DetailField label="SMS" value={customer.marketingSmsOptIn ? 'Opted in' : 'Opted out'} />
              <DetailField label="Push" value={customer.marketingPushOptIn ? 'Opted in' : 'Opted out'} />
            </Stack>
          </DetailSectionCard>
        }
      />

      <DetailSectionCard title="CRM notes & tags" description="Staff-visible tags and internal notes.">
        <FormField label="Tags" htmlFor={tagsId} helper="Comma-separated tags">
          <Input
            id={tagsId}
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder="VIP, Wholesale, Staff"
          />
        </FormField>
        <FormField label="Staff notes" htmlFor={notesId} className="mt-4">
          <Textarea
            id={notesId}
            className="min-h-28"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Customer preferences, service notes, allergy notes, or wholesale terms"
          />
        </FormField>
        <FormActions className="mt-4">
          <Button type="button" onClick={() => void saveTags()}>
            Save CRM profile
          </Button>
          <Button type="button" variant="outline" onClick={() => void refresh()}>
            Update insights
          </Button>
        </FormActions>
        </DetailSectionCard>

      <DetailTwoColumn
        primary={
          <DetailSectionCard title="Categories purchased">
            <TagGroup>
              {customer.insight?.categoriesPurchased.map((category) => (
                <Tag key={category} variant="neutral">
                  <TagLabel>{category}</TagLabel>
                </Tag>
              ))}
              {!customer.insight?.categoriesPurchased.length ? (
                <PanelEmpty title="No product categories recorded yet" description="Content will appear here when available." />
              ) : null}
            </TagGroup>
          </DetailSectionCard>
        }
        secondary={
          <DetailSectionCard title="Gift cards">
            <Stack gap="sm">
              {customer.giftCards.map((card) => {

                const row = card as { id?: string; code?: string; balance?: string };
                return (
                  <p key={row.id ?? row.code} className="text-sm text-foreground">
                    {row.code ?? 'Gift card'} · {formatMoney(row.balance ?? '0')}
                  </p>
                );
              })}
              {!customer.giftCards.length ? (
                <PanelEmpty title="No linked gift cards" description="Content will appear here when available." />
              ) : null}
            </Stack>
          </DetailSectionCard>
        }
      />

      <div className="grid grid-cols-1 gap-6 min-[769px]:grid-cols-3">
        <DetailSectionCard title="Address book">
          <Stack gap="sm">
            {customer.addresses.map((address, index) => (
              <div key={String(field(address, 'id') ?? index)} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">
                  {String(field(address, 'label') ?? 'Address')}{' '}
                  {field(address, 'isDefault') ? '· Default' : ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {String(field(address, 'line1') ?? field(address, 'addressLine1') ?? '')},{' '}
                  {String(field(address, 'city') ?? '')}
                </p>
              </div>
            ))}
            {!customer.addresses.length ? (
              <PanelEmpty title="No saved addresses" description="Content will appear here when available." />
            ) : null}
          </Stack>
        </DetailSectionCard>
        <DetailSectionCard title="Saved baskets">
          <Stack gap="sm">
            {customer.savedBaskets.map((basket, index) => (
              <p key={String(field(basket, 'id') ?? index)} className="text-sm text-foreground">
                {String(field(basket, 'name') ?? 'Saved basket')} · {String(field(basket, 'itemCount') ?? 0)} items
              </p>
            ))}
            {!customer.savedBaskets.length ? (
              <PanelEmpty title="No saved baskets" description="Content will appear here when available." />
            ) : null}
          </Stack>
        </DetailSectionCard>
        <DetailSectionCard title="Saved items">
          <Stack gap="sm">
            {customer.savedItems.map((item, index) => (
              <p key={String(field(item, 'id') ?? index)} className="text-sm text-foreground">
                {String(field(item, 'label') ?? field(item, 'productId') ?? 'Saved item')}
              </p>
            ))}
            {!customer.savedItems.length ? (
              <PanelEmpty title="No saved items" description="Content will appear here when available." />
            ) : null}
          </Stack>
        </DetailSectionCard>
      </div>

      <DetailSectionCard title="Order history" description="Recent orders for this customer.">
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {customer.orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber ?? order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.orderType}</TableCell>
                <TableCell>
                  <DetailStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="tabular-nums">{formatMoney(order.total)}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DetailSectionCard>
    </Stack>
  );
}
