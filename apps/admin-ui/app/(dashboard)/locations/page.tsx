'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { EmptyState, EmptyStateActionLink } from '@/components/ui/empty-state';
import { TablePanelSkeleton } from '@/components/ui/admin-loader';
import { FormErrorAlert } from '@/components/ui/admin-form-validation';
import { PageHeader, PageHeaderActionLink } from '@/components/ui/page-header';
import { MapPin } from 'lucide-react';
import {
  disableLocation,
  fetchLocations,
  type LocationListItem,
} from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';
import { DisableConfirmDialog } from '@/components/ui/admin-dialog';
import { usePageRefreshShortcut } from '@/components/ui/admin-shortcuts';
import { useAdminQuery } from '@/components/ui/admin-performance';
import { timedAdminFetcher } from '@/lib/admin-timing';
import { useTranslation } from '@/components/ui/admin-i18n';

export default function LocationsPage() {
  const { t } = useTranslation();
  const [disableTarget, setDisableTarget] = useState<LocationListItem | null>(null);
  const [disableLoading, setDisableLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: locations = [],
    error,
    isLoading,
    mutate,
  } = useAdminQuery(['locations', 'list'], timedAdminFetcher('locations.list', fetchLocations));

  const load = useCallback(() => mutate(), [mutate]);
  const listError = actionError ?? (error ? getErrorMessage(error) : null);

  usePageRefreshShortcut({ onRefresh: () => void load() });

  async function confirmDisable() {
    if (!disableTarget) return;
    setDisableLoading(true);
    setActionError(null);
    try {
      await disableLocation(disableTarget.id);
      setDisableTarget(null);
      await load();
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setDisableLoading(false);
    }
  }

  return (
    <>
      <DisableConfirmDialog
        open={!!disableTarget}
        onOpenChange={(open) => {
          if (!open) setDisableTarget(null);
        }}
        itemName={disableTarget?.name}
        title={
          disableTarget
            ? t('locations.disableTitleNamed', { name: disableTarget.name })
            : t('locations.disableTitle')
        }
        description={t('locations.disableDescription')}
        confirmLabel={t('common.disable')}
        loading={disableLoading}
        onConfirm={confirmDisable}
      />
      <PageHeader
        title={t('locations.title')}
        description={t('locations.description')}
        actions={
          <PageHeaderActionLink
            label={t('locations.addLocation')}
            href="/locations/new"
            shortcut="n"
          />
        }
      />

      <FormErrorAlert message={listError} title={t('error.loadLocations')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('locations.allLocations')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TablePanelSkeleton rows={5} columns={4} />
          ) : locations.length === 0 ? (
            <EmptyState
              title={t('empty.noLocations')}
              description={t('empty.noLocationsDescription')}
              icon={MapPin}
              action={
                <EmptyStateActionLink label={t('locations.addLocation')} href="/locations/new" />
              }
            />
          ) : (
            <Table aria-label={t('table.locationsAria')}>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.address')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.staff')}</TableHead>
                  <TableHead>{t('table.inventory')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>{loc.address ?? '—'}</TableCell>
                    <TableCell>
                      <Tag variant={loc.isActive ? 'brand' : 'neutral'}>
                        <TagLabel>{loc.status}</TagLabel>
                      </Tag>
                    </TableCell>
                    <TableCell>{loc.staffCount}</TableCell>
                    <TableCell>
                      {loc.inventoryStatus === 'low_stock' ? (
                        <Tag variant="error">
                          <TagLabel>
                            {t('table.lowStock', { count: loc.lowStockCount })}
                          </TagLabel>
                        </Tag>
                      ) : loc.inventoryStatus === 'empty' ? (
                        <span className="text-muted-foreground">{t('table.noStock')}</span>
                      ) : (
                        <span>{t('table.stockOk')}</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/locations/${loc.id}`}>{t('common.edit')}</Link>
                      </Button>
                      {loc.isActive ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDisableTarget(loc)}
                        >
                          {t('common.disable')}
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
