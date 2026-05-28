'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useMemo, useState } from 'react';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack, Textarea } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  assignEnterpriseAccess,
  assignRegionLocations,
  createEnterpriseRegion,
  updateEnterpriseSettings,
  updateEnterpriseSsoPolicy,
  type EnterpriseDashboard,
  type EnterpriseHierarchy,
} from '@/lib/api/admin/enterprise';
import { createRole, type Permission, type Role, type StaffMember } from '@/lib/api/staff';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

import { PanelEmpty } from '@/components/ui/admin-empty-state';

const money = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });

export function EnterpriseAdminPanel({
  initialHierarchy,
  initialDashboard,
  staff,
  roles,
  permissions,
}: {
  initialHierarchy: EnterpriseHierarchy;
  initialDashboard: EnterpriseDashboard;
  staff: StaffMember[];
  roles: Role[];
  permissions: Permission[];
}) {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const [hierarchy, setHierarchy] = useState(initialHierarchy);
  const [dashboard] = useState(initialDashboard);
  const [roleRows, setRoleRows] = useState(roles);
  const [regionName, setRegionName] = useState('');
  const [regionType, setRegionType] = useState('custom');
  const [selectedRegionId, setSelectedRegionId] = useState(initialHierarchy.regions[0]?.id ?? '');
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [accessForm, setAccessForm] = useState({
    userId: staff[0]?.id ?? '',
    roleId: roles[0]?.id ?? '',
    scopeType: 'region',
    staffRole: 'regional_manager',
  });
  const [settingsJson, setSettingsJson] = useState(JSON.stringify(initialHierarchy.organization.globalSettings, null, 2));
  const [ssoJson, setSsoJson] = useState(JSON.stringify(initialHierarchy.organization.ssoPolicy, null, 2));
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });
    const regionNameById = useMemo(() => new Map(hierarchy.regions.map((region) => [region.id, region.name])), [hierarchy.regions]);

  async function submitRegion(event: React.FormEvent) {
    event.preventDefault();
    try {
      const region = await createEnterpriseRegion(createBrowserApiClient(), {
        organizationId: hierarchy.organization.id,
        name: regionName,
        regionType,
      });
      setHierarchy((current) => ({ ...current, regions: [...current.regions, region] }));
      setRegionName('');
      setSelectedRegionId(region.id);
      toastSuccess('Region created');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitRegionLocations(event: React.FormEvent) {
    event.preventDefault();
    try {
      const updated = await assignRegionLocations(createBrowserApiClient(), selectedRegionId, selectedLocationIds);
      setHierarchy(updated);
      setSelectedLocationIds([]);
      toastSuccess('Locations assigned to region');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitAccess(event: React.FormEvent) {
    event.preventDefault();
    try {
      const payload = {
        ...accessForm,
        organizationId: accessForm.scopeType === 'organization' ? hierarchy.organization.id : undefined,
        regionId: accessForm.scopeType === 'region' ? selectedRegionId : undefined,
        locationId: accessForm.scopeType === 'location' ? selectedLocationIds[0] : undefined,
      };
      const assignment = await assignEnterpriseAccess(createBrowserApiClient(), payload);
      setHierarchy((current) => ({ ...current, assignments: [assignment, ...current.assignments] }));
      toastSuccess('Access scope assigned');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitSettings(event: React.FormEvent) {
    event.preventDefault();
    try {
      const organization = await updateEnterpriseSettings(createBrowserApiClient(), hierarchy.organization.id, {
        globalSettings: JSON.parse(settingsJson) as Record<string, unknown>,
      });
      setHierarchy((current) => ({ ...current, organization }));
      toastSuccess('Enterprise settings updated');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitSso(event: React.FormEvent) {
    event.preventDefault();
    try {
      await updateEnterpriseSsoPolicy(createBrowserApiClient(), hierarchy.organization.id, JSON.parse(ssoJson) as Record<string, unknown>);
      toastSuccess('SSO policy updated');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  async function submitRole(event: React.FormEvent) {
    event.preventDefault();
    try {
      const role = await createRole(roleForm);
      setRoleRows((current) => [...current, role]);
      setRoleForm({ name: '', description: '', permissions: [] });
      toastSuccess('Custom role created');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  }

  function toggleLocation(id: string) {
    setSelectedLocationIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function togglePermission(key: string) {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key],
    }));
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <MetricGrid columns={4}>
        <MetricCard title="Roll-up sales" value={money.format(dashboard.sales.revenue)} detail={`${dashboard.sales.orders} orders`} />
        <MetricCard title="Inventory health" value={`${dashboard.inventory.lowStock} low`} detail={`${dashboard.inventory.totalItems} stock items`} />
        <MetricCard title="Delivery performance" value={`${Math.round(dashboard.delivery.completionRate * 100)}%`} detail={`${dashboard.delivery.delivered}/${dashboard.delivery.totalDeliveries} delivered`} />
        <MetricCard title="Staff coverage" value={String(dashboard.staff.staffCount)} detail={`${dashboard.scope.locationIds.length} visible locations`} />
      </MetricGrid>

      <Card>
        <CardHeader>
          <CardTitle>Organization Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="text-lg font-semibold">{hierarchy.organization.name}</p>
              <p className="text-xs text-muted-foreground">{hierarchy.organization.slug}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Regions</p>
              <p className="text-lg font-semibold">{hierarchy.regions.length}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-lg font-semibold">{hierarchy.locations.length}</p>
            </div>
          </div>

          <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={submitRegion}>
            <Input placeholder="New region name" value={regionName} onChange={(event) => setRegionName(event.target.value)} required />
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={regionType} onChange={(event) => setRegionType(event.target.value)}>
              <option value="custom">Custom</option>
              <option value="country">Country</option>
              <option value="state">State</option>
            </Select>
            <Button type="submit">Create region</Button>
          </form>

          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody zebra>
              {hierarchy.locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedLocationIds.includes(location.id)} onChange={() => toggleLocation(location.id)} />
                      {location.name}
                    </label>
                  </TableCell>
                  <TableCell>{location.locationType}</TableCell>
                  <TableCell>{location.regionId ? regionNameById.get(location.regionId) ?? 'Unknown' : 'Unassigned'}</TableCell>
                  <TableCell><Tag variant="outline"><TagLabel>{location.status}</TagLabel></Tag></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <form className="flex flex-wrap gap-3" onSubmit={submitRegionLocations}>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={selectedRegionId} onChange={(event) => setSelectedRegionId(event.target.value)} required>
              {hierarchy.regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
            </Select>
            <Button type="submit" disabled={!selectedRegionId || selectedLocationIds.length === 0}>Assign selected locations</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managers & Access Scopes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 lg:grid-cols-5" onSubmit={submitAccess}>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={accessForm.userId} onChange={(event) => setAccessForm((current) => ({ ...current, userId: event.target.value }))}>
              {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </Select>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={accessForm.roleId} onChange={(event) => setAccessForm((current) => ({ ...current, roleId: event.target.value }))}>
              {roleRows.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </Select>
            <Select className="rounded-md border bg-background px-3 py-2 text-sm" value={accessForm.scopeType} onChange={(event) => setAccessForm((current) => ({ ...current, scopeType: event.target.value }))}>
              <option value="organization">Enterprise</option>
              <option value="region">Region</option>
              <option value="location">Location</option>
            </Select>
            <Input value={accessForm.staffRole} onChange={(event) => setAccessForm((current) => ({ ...current, staffRole: event.target.value }))} />
            <Button type="submit">Assign access</Button>
          </form>
          <div className="grid gap-2 md:grid-cols-2">
            {hierarchy.assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{assignment.staffRole}</p>
                <p className="text-muted-foreground">{assignment.scopeType}: {assignment.regionId ?? assignment.locationId ?? assignment.organizationId}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enterprise Dashboards</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <PerformanceTable title="Region vs Region" rows={dashboard.regionComparisons} nameKey="regionName" />
          <PerformanceTable title="Top Locations" rows={dashboard.topLocations} nameKey="locationName" />
          <PerformanceTable title="Bottom Locations" rows={dashboard.bottomLocations} nameKey="locationName" />
          <div className="rounded-md border p-3">
            <p className="font-medium">Location-level operations</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Location dashboards roll up store KPIs, staff coverage, inventory health, replenishment pressure, delivery metrics, and support visibility for the selected scope.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Roles & Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-3" onSubmit={submitRole}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Custom role name" value={roleForm.name} onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))} required />
              <Input placeholder="Description" value={roleForm.description} onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))} />
            </div>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-auto rounded-md border p-3">
              {permissions.map((permission) => (
                <label key={permission.key} className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                  <input type="checkbox" checked={roleForm.permissions.includes(permission.key)} onChange={() => togglePermission(permission.key)} />
                  {permission.key}
                </label>
              ))}
            </div>
            <Button type="submit">Create custom role</Button>
          </form>
          <div className="grid gap-2 md:grid-cols-2">
            {hierarchy.permissionMatrix.map((row) => (
              <div key={`${row.role}-${row.scope}`} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{row.role}</p>
                <p className="text-muted-foreground">{row.scope}</p>
                <p className="mt-1 text-xs">{row.permissions.join(', ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enterprise Settings & SSO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <form className="space-y-3" onSubmit={submitSettings}>
            <p className="text-sm text-muted-foreground">Global tax, promotion, catalog, region override, and location override policies live in inherited enterprise settings.</p>
            <Textarea className="min-h-40 w-full rounded-md border bg-background p-3 font-mono text-xs" value={settingsJson} onChange={(event) => setSettingsJson(event.target.value)} />
            <Button type="submit">Save enterprise settings</Button>
          </form>
          <form className="space-y-3" onSubmit={submitSso}>
            <p className="text-sm text-muted-foreground">Phase 1 SSO policy supports SAML/OAuth enforcement hints and delegates provider details to existing Enterprise SSO settings.</p>
            <Textarea className="min-h-40 w-full rounded-md border bg-background p-3 font-mono text-xs" value={ssoJson} onChange={(event) => setSsoJson(event.target.value)} />
            <Button type="submit">Save SSO policy</Button>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}


function PerformanceTable({ title, rows, nameKey }: { title: string; rows: Array<Record<string, unknown>>; nameKey: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 font-medium">{title}</p>
      <div className="space-y-2">
        {rows.length ? rows.map((row, index) => (
          <div key={`${title}-${index}`} className="flex items-center justify-between gap-3 text-sm">
            <span>{String(row[nameKey] ?? 'Unknown')}</span>
            <span className="font-medium">{money.format(Number(row.revenue ?? 0))}</span>
          </div>
        )) : (
          <PanelEmpty
            title="No hierarchy data"
            description="Organization hierarchy will appear once regions and locations are configured."
          />
        )}
      </div>
    </div>
  );
}
