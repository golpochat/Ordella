'use client';

import { Tag, TagLabel } from '@/components/ui/admin-tag';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { Select, Button, Card, CardContent, IconButton, Input , Stack } from '@shared-ui';
import {
  AdminTableShell,
  Table,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/admin-table';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  createSsoProvider,
  listFederatedUsers,
  listSsoProviders,
  listSsoRoleMappings,
  resetFederatedUser,
  updateSsoProvider,
  updateSsoRoleMappings,
  type FederatedUser,
  type SsoProvider,
  type SsoRoleMapping,
} from '@/lib/api/admin/enterprise-sso';
import { getErrorMessage } from '@/lib/utils';
import { Metric, MetricCard, MetricGrid } from '@/components/ui/admin-card';

type ProviderForm = {
  id?: string;
  providerType: 'azure_ad' | 'okta' | 'google' | 'saml' | 'oidc';
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
  redirectUrl: string;
  metadataUrl: string;
  authorizationUrl: string;
  tokenUrl: string;
  jwksUri: string;
  defaultRole: string;
  isActive: boolean;
};

const emptyProvider: ProviderForm = {
  providerType: 'oidc',
  clientId: '',
  clientSecret: '',
  issuerUrl: '',
  redirectUrl: '',
  metadataUrl: '',
  authorizationUrl: '',
  tokenUrl: '',
  jwksUri: '',
  defaultRole: 'staff',
  isActive: true,
};

const INTERNAL_ROLES = ['admin', 'manager', 'staff', 'fulfillment', 'driver', 'owner', 'FranchiseHQ'];

export function EnterpriseSsoPanel() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const api = useMemo(() => createBrowserApiClient(), []);
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [mappings, setMappings] = useState<SsoRoleMapping[]>([]);
  const [federatedUsers, setFederatedUsers] = useState<FederatedUser[]>([]);
  const [providerForm, setProviderForm] = useState<ProviderForm>(emptyProvider);
  const [mappingDrafts, setMappingDrafts] = useState<Array<{ externalRole: string; internalRole: string; providerId?: string }>>([]);
    const load = useCallback(async () => {

    try {
      const [nextProviders, nextMappings, nextUsers] = await Promise.all([
        listSsoProviders(api),
        listSsoRoleMappings(api),
        listFederatedUsers(api),
      ]);
      setProviders(nextProviders);
      setMappings(nextMappings);
      setFederatedUsers(nextUsers);
      setMappingDrafts(nextMappings.map((mapping) => ({
        externalRole: mapping.externalRole,
        internalRole: mapping.internalRole,
        providerId: mapping.providerId ?? undefined,
      })));
      } catch (err) {
      toastError(getErrorMessage(err));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const editProvider = (provider: SsoProvider) => {
    setProviderForm({
      id: provider.id,
      providerType: provider.providerType,
      clientId: provider.clientId ?? '',
      clientSecret: '',
      issuerUrl: provider.issuerUrl ?? '',
      redirectUrl: provider.redirectUrl ?? '',
      metadataUrl: provider.metadataUrl ?? '',
      authorizationUrl: provider.authorizationUrl ?? '',
      tokenUrl: provider.tokenUrl ?? '',
      jwksUri: provider.jwksUri ?? '',
      defaultRole: provider.defaultRole ?? 'staff',
      isActive: provider.isActive,
    });
  };

  const saveProvider = async () => {
    try {
      const body = {
        id: providerForm.id,
        providerType: providerForm.providerType,
        clientId: providerForm.clientId || undefined,
        clientSecret: providerForm.clientSecret || undefined,
        issuerUrl: providerForm.issuerUrl || undefined,
        redirectUrl: providerForm.redirectUrl || undefined,
        metadataUrl: providerForm.metadataUrl || undefined,
        authorizationUrl: providerForm.authorizationUrl || undefined,
        tokenUrl: providerForm.tokenUrl || undefined,
        jwksUri: providerForm.jwksUri || undefined,
        defaultRole: providerForm.defaultRole || undefined,
        isActive: providerForm.isActive,
      };
      if (providerForm.id) await updateSsoProvider(api, body);
      else await createSsoProvider(api, body);
      setProviderForm(emptyProvider);
      toastSuccess('Provider saved');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const saveMappings = async () => {
    try {
      await updateSsoRoleMappings(api, mappingDrafts.filter((mapping) => mapping.externalRole && mapping.internalRole));
      toastSuccess('Role mappings saved');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const testConnection = async () => {
    const provider = providers.find((row) => row.id === providerForm.id) ?? providers[0];
    if (!provider) {
      toastError('Save an SSO provider before testing');
      return;
    }
    const res = await fetch('/api/auth/sso/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: provider.id,
        tenantId: provider.tenantId,
        redirectUrl: provider.redirectUrl,
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toastError((body as { message?: string } | null)?.message ?? 'Connection test failed');
      return;
    }
    toastSuccess('Connection test generated a valid SSO authorization URL');
  };

  const activeProviders = providers.filter((provider) => provider.isActive).length;
  const mappedRoles = mappings.length;

  return (
    <Stack gap="lg" className="min-w-0">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Active providers" value={activeProviders} />
        <MetricCard label="Role mappings" value={mappedRoles} />
        <MetricCard label="Federated users" value={federatedUsers.length} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Provider setup</h2>
              <p className="text-sm text-muted-foreground">
                Configure OIDC or SAML per tenant. Secrets are encrypted before storage.
              </p>
            </div>
            {providerForm.id ? (
              <Button type="button" variant="outline" onClick={() => setProviderForm(emptyProvider)}>
                New provider
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={providerForm.providerType} onChange={(event) => setProviderForm({ ...providerForm, providerType: event.target.value as ProviderForm['providerType'] })}>
              <option value="azure_ad">Azure AD</option>
              <option value="okta">Okta</option>
              <option value="google">Google Workspace</option>
              <option value="oidc">Generic OIDC</option>
              <option value="saml">Generic SAML</option>
            </Select>
            <Input placeholder="Default internal role" value={providerForm.defaultRole} onChange={(event) => setProviderForm({ ...providerForm, defaultRole: event.target.value })} />
            <Input placeholder="Client ID / Audience" value={providerForm.clientId} onChange={(event) => setProviderForm({ ...providerForm, clientId: event.target.value })} />
            <Input placeholder="Client secret" type="password" value={providerForm.clientSecret} onChange={(event) => setProviderForm({ ...providerForm, clientSecret: event.target.value })} />
            <Input placeholder="Issuer URL" value={providerForm.issuerUrl} onChange={(event) => setProviderForm({ ...providerForm, issuerUrl: event.target.value })} />
            <Input placeholder="Redirect URL" value={providerForm.redirectUrl} onChange={(event) => setProviderForm({ ...providerForm, redirectUrl: event.target.value })} />
            <Input placeholder="Metadata URL (SAML)" value={providerForm.metadataUrl} onChange={(event) => setProviderForm({ ...providerForm, metadataUrl: event.target.value })} />
            <Input placeholder="Authorization URL" value={providerForm.authorizationUrl} onChange={(event) => setProviderForm({ ...providerForm, authorizationUrl: event.target.value })} />
            <Input placeholder="Token URL" value={providerForm.tokenUrl} onChange={(event) => setProviderForm({ ...providerForm, tokenUrl: event.target.value })} />
            <Input placeholder="JWKS URI" value={providerForm.jwksUri} onChange={(event) => setProviderForm({ ...providerForm, jwksUri: event.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={providerForm.isActive} onChange={(event) => setProviderForm({ ...providerForm, isActive: event.target.checked })} />
              Active
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={saveProvider}>Save provider</Button>
            <Button type="button" variant="outline" onClick={testConnection}>Test connection</Button>
          </div>
        </CardContent>
      </Card>

      <AdminTableShell
        isEmpty={providers.length === 0}
        emptyTitle="No SSO providers"
        emptyDescription="Configure an identity provider to enable enterprise SSO."
      >
        <Table>
          <TableHeader sticky>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead>Redirect</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody zebra>
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.providerType}</TableCell>
                <TableCell className="text-muted-foreground">{provider.issuerUrl ?? provider.metadataUrl ?? 'Not set'}</TableCell>
                <TableCell className="text-muted-foreground">{provider.redirectUrl ?? 'Not set'}</TableCell>
                <TableCell>
                  <Tag variant={provider.isActive ? 'brand' : 'neutral'}><TagLabel>{provider.isActive ? 'Active' : 'Off'}</TagLabel></Tag>
                </TableCell>
                <TableCell className="text-right">
                  <TableActions>
                    <IconButton
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Edit ${provider.providerType} provider`}
                      onClick={() => editProvider(provider)}
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                  </TableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Role mapping</h2>
              <p className="text-sm text-muted-foreground">
                Map IdP groups or roles to Ordella tenant roles used for permissions.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => setMappingDrafts([...mappingDrafts, { externalRole: '', internalRole: 'staff', providerId: providers[0]?.id }])}>
              Add mapping
            </Button>
          </div>
          <div className="space-y-3">
            {mappingDrafts.map((mapping, index) => (
              <div key={`${mapping.externalRole}-${index}`} className="grid gap-2 rounded-lg border p-3 md:grid-cols-4">
                <Input placeholder="External role/group" value={mapping.externalRole} onChange={(event) => setMappingDrafts((current) => current.map((row, i) => i === index ? { ...row, externalRole: event.target.value } : row))} />
                <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={mapping.internalRole} onChange={(event) => setMappingDrafts((current) => current.map((row, i) => i === index ? { ...row, internalRole: event.target.value } : row))}>
                  {INTERNAL_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </Select>
                <Select className="h-10 rounded-md border bg-background px-3 text-sm" value={mapping.providerId ?? ''} onChange={(event) => setMappingDrafts((current) => current.map((row, i) => i === index ? { ...row, providerId: event.target.value || undefined } : row))}>
                  <option value="">All providers</option>
                  {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.providerType}</option>)}
                </Select>
                <Button type="button" variant="ghost" onClick={() => setMappingDrafts((current) => current.filter((_, i) => i !== index))}>Remove</Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={saveMappings}>Save mappings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Staff provisioning</h2>
          <AdminTableShell
            isEmpty={federatedUsers.length === 0}
            emptyTitle="No federated users"
            emptyDescription="Staff who sign in via SSO will appear here."
          >
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>External roles</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="w-[1%] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody zebra>
                {federatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>{user.roleName ?? user.roleId}</TableCell>
                    <TableCell>{user.federatedRoles.join(', ') || 'None'}</TableCell>
                    <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</TableCell>
                    <TableCell className="text-right">
                      <TableActions>
                        <IconButton
                          type="button"
                          size="sm"
                          variant="outline"
                          aria-label={`Reset local overrides for ${user.name}`}
                          onClick={() => void resetFederatedUser(api, user.id).then(load)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </IconButton>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableShell>
        </CardContent>
      </Card>
    </Stack>
  );
}

