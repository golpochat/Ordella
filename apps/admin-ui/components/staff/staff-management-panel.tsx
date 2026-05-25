'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { fetchLocations, type LocationListItem } from '@/lib/api/locations';
import {
  createRole,
  createStaff,
  deleteRole,
  disableStaff,
  duplicateRole,
  listPermissions,
  listRoles,
  listStaff,
  updateRole,
  updateStaff,
  type Permission,
  type Role,
  type StaffMember,
} from '@/lib/api/staff';
import { getErrorMessage } from '@/lib/utils';

const EMPTY_STAFF = {
  id: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  roleId: '',
  assignedLocations: [] as string[],
  isActive: true,
};

const EMPTY_ROLE = {
  id: '',
  name: '',
  description: '',
  permissions: [] as string[],
};

export function StaffManagementPanel() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [staffForm, setStaffForm] = useState(EMPTY_STAFF);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStaff, setSavingStaff] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const locationNameById = useMemo(
    () => new Map(locations.map((location) => [location.id, location.name])),
    [locations],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRows, roleRows, permissionRows, locationRows] = await Promise.all([
        listStaff(),
        listRoles(),
        listPermissions(),
        fetchLocations(),
      ]);
      setStaff(staffRows);
      setRoles(roleRows);
      setPermissions(permissionRows);
      setLocations(locationRows);
      if (!staffForm.roleId && roleRows[0]) {
        setStaffForm((current) => ({ ...current, roleId: roleRows[0].id }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [staffForm.roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  function resetStaffForm() {
    setStaffForm({ ...EMPTY_STAFF, roleId: roles[0]?.id ?? '' });
  }

  function editStaff(member: StaffMember) {
    setStaffForm({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone ?? '',
      password: '',
      roleId: member.roleId,
      assignedLocations: member.assignedLocations,
      isActive: member.isActive,
    });
  }

  async function submitStaff(e: React.FormEvent) {
    e.preventDefault();
    setSavingStaff(true);
    setError(null);
    try {
      if (staffForm.id) {
        await updateStaff({
          id: staffForm.id,
          name: staffForm.name,
          email: staffForm.email,
          phone: staffForm.phone,
          ...(staffForm.password ? { password: staffForm.password } : {}),
          roleId: staffForm.roleId,
          assignedLocations: staffForm.assignedLocations,
          isActive: staffForm.isActive,
        });
      } else {
        await createStaff({
          name: staffForm.name,
          email: staffForm.email,
          phone: staffForm.phone,
          password: staffForm.password,
          roleId: staffForm.roleId,
          assignedLocations: staffForm.assignedLocations,
        });
      }
      resetStaffForm();
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingStaff(false);
    }
  }

  async function submitRole(e: React.FormEvent) {
    e.preventDefault();
    setSavingRole(true);
    setError(null);
    try {
      if (roleForm.id) {
        await updateRole({
          id: roleForm.id,
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        });
      } else {
        await createRole({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions,
        });
      }
      setRoleForm(EMPTY_ROLE);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingRole(false);
    }
  }

  function toggleStaffLocation(locationId: string) {
    setStaffForm((current) => ({
      ...current,
      assignedLocations: current.assignedLocations.includes(locationId)
        ? current.assignedLocations.filter((id) => id !== locationId)
        : [...current.assignedLocations, locationId],
    }));
  }

  function toggleRolePermission(permission: string) {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((key) => key !== permission)
        : [...current.permissions, permission],
    }));
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading staff…</p>;
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-md border border-destructive p-3 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Business Staff</CardTitle>
          <CardDescription>Staff can be assigned to one location, multiple locations, or all locations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned locations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </TableCell>
                  <TableCell>{member.roleName ?? 'Unassigned'}</TableCell>
                  <TableCell>
                    {member.assignedLocations.length === 0
                      ? 'All locations'
                      : member.assignedLocations
                          .map((id) => locationNameById.get(id) ?? id)
                          .join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? 'secondary' : 'destructive'}>
                      {member.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => editStaff(member)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void disableStaff(member.id).then(load).catch((err) => setError(getErrorMessage(err)))}
                      disabled={!member.isActive}
                    >
                      Disable
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{staffForm.id ? 'Edit Staff Member' : 'Add Staff Member'}</CardTitle>
          <CardDescription>Use retail-agnostic roles and location assignments for POS, fulfillment, delivery, and admin access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submitStaff}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name">
                <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
              </Field>
              <Field label="Phone">
                <Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
              </Field>
              <Field label={staffForm.id ? 'New password (optional)' : 'Password'}>
                <Input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required={!staffForm.id}
                />
              </Field>
              <Field label="Role">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={staffForm.roleId}
                  onChange={(e) => setStaffForm({ ...staffForm, roleId: e.target.value })}
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2 pt-7 text-sm">
                <input
                  type="checkbox"
                  checked={staffForm.isActive}
                  onChange={(e) => setStaffForm({ ...staffForm, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>

            <CheckboxGroup
              label="Assigned locations"
              help="Leave all unchecked for all locations."
              options={locations.map((location) => ({ key: location.id, label: location.name }))}
              selected={staffForm.assignedLocations}
              onToggle={toggleStaffLocation}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={savingStaff}>
                {staffForm.id ? 'Save staff' : 'Create staff'}
              </Button>
              <Button type="button" variant="outline" onClick={resetStaffForm}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Create custom roles, duplicate defaults, and assign permission groups.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {roles.map((role) => (
              <div key={role.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.permissions.length} permissions</p>
                  </div>
                  {role.isSystemRole ? <Badge variant="outline">Default</Badge> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setRoleForm({ id: role.id, name: role.name, description: role.description ?? '', permissions: role.permissions })}>
                    Edit
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => void duplicateRole(role.id).then(load).catch((err) => setError(getErrorMessage(err)))}>
                    Duplicate
                  </Button>
                  <Button type="button" variant="destructive" size="sm" disabled={role.name === 'owner'} onClick={() => void deleteRole(role.id).then(load).catch((err) => setError(getErrorMessage(err)))}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <form className="space-y-4" onSubmit={submitRole}>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Role name">
                <Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required />
              </Field>
              <Field label="Description">
                <Input value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} />
              </Field>
            </div>
            <CheckboxGroup
              label="Permissions"
              options={permissions.map((permission) => ({ key: permission.key, label: permission.key }))}
              selected={roleForm.permissions}
              onToggle={toggleRolePermission}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={savingRole}>
                {roleForm.id ? 'Save role' : 'Create role'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRoleForm(EMPTY_ROLE)}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CheckboxGroup({
  label,
  help,
  options,
  selected,
  onToggle,
}: {
  label: string;
  help?: string;
  options: Array<{ key: string; label: string }>;
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
      <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-2">
        {options.map((option) => (
          <label key={option.key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option.key)}
              onChange={() => onToggle(option.key)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
