'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, CardContent, Input } from '@shared-ui';
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
  const api = useMemo(() => createBrowserApiClient(), []);
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [mappings, setMappings] = useState<SsoRoleMapping[]>([]);
  const [federatedUsers, setFederatedUsers] = useState<FederatedUser[]>([]);
  const [providerForm, setProviderForm] = useState<ProviderForm>(emptyProvider);
  const [mappingDrafts, setMappingDrafts] = useState<Array<{ externalRole: string; internalRole: string; providerId?: string }>>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
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
      setMessage('Provider saved');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saveMappings = async () => {
    try {
      await updateSsoRoleMappings(api, mappingDrafts.filter((mapping) => mapping.externalRole && mapping.internalRole));
      setMessage('Role mappings saved');
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const testConnection = async () => {
    const provider = providers.find((row) => row.id === providerForm.id) ?? providers[0];
    if (!provider) {
      setError('Save an SSO provider before testing');
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
      setError((body as { message?: string } | null)?.message ?? 'Connection test failed');
      return;
    }
    setMessage('Connection test generated a valid SSO authorization URL');
  };

  const activeProviders = providers.filter((provider) => provider.isActive).length;
  const mappedRoles = mappings.length;

  return (
    <div className="space-y-6">
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

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
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={providerForm.providerType} onChange={(event) => setProviderForm({ ...providerForm, providerType: event.target.value as ProviderForm['providerType'] })}>
              <option value="azure_ad">Azure AD</option>
              <option value="okta">Okta</option>
              <option value="google">Google Workspace</option>
              <option value="oidc">Generic OIDC</option>
              <option value="saml">Generic SAML</option>
            </select>
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

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Provider</th>
              <th className="p-3 font-medium">Issuer</th>
              <th className="p-3 font-medium">Redirect</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider.id} className="border-t">
                <td className="p-3 font-medium">{provider.providerType}</td>
                <td className="p-3 text-muted-foreground">{provider.issuerUrl ?? provider.metadataUrl ?? 'Not set'}</td>
                <td className="p-3 text-muted-foreground">{provider.redirectUrl ?? 'Not set'}</td>
                <td className="p-3"><Badge variant={provider.isActive ? 'default' : 'secondary'}>{provider.isActive ? 'Active' : 'Off'}</Badge></td>
                <td className="p-3"><Button type="button" size="sm" variant="outline" onClick={() => editProvider(provider)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={mapping.internalRole} onChange={(event) => setMappingDrafts((current) => current.map((row, i) => i === index ? { ...row, internalRole: event.target.value } : row))}>
                  {INTERNAL_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <select className="h-10 rounded-md border bg-background px-3 text-sm" value={mapping.providerId ?? ''} onChange={(event) => setMappingDrafts((current) => current.map((row, i) => i === index ? { ...row, providerId: event.target.value || undefined } : row))}>
                  <option value="">All providers</option>
                  {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.providerType}</option>)}
                </select>
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
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Staff</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">External roles</th>
                  <th className="p-3 font-medium">Last login</th>
                  <th className="p-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {federatedUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </td>
                    <td className="p-3">{user.roleName ?? user.roleId}</td>
                    <td className="p-3">{user.federatedRoles.join(', ') || 'None'}</td>
                    <td className="p-3">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                    <td className="p-3">
                      <Button type="button" size="sm" variant="outline" onClick={() => void resetFederatedUser(api, user.id).then(load)}>
                        Reset local overrides
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
