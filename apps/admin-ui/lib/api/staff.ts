import { createBrowserApiClient } from './browser';

export type StaffMember = {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string | null;
  roleId: string;
  roleName: string | null;
  permissions: string[];
  assignedLocations: string[];
  isActive: boolean;
  status: string;
  externalId?: string | null;
  federatedRoles?: string[];
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystemRole: boolean;
};

export type Permission = {
  id: string;
  key: string;
  description: string | null;
};

export async function listStaff(): Promise<StaffMember[]> {
  return createBrowserApiClient().getData<StaffMember[]>('staff/list');
}

export async function createStaff(body: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  roleId: string;
  assignedLocations: string[];
}): Promise<StaffMember> {
  return createBrowserApiClient().postData<StaffMember>('staff/create', body);
}

export async function updateStaff(body: {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: string;
  assignedLocations?: string[];
  isActive?: boolean;
}): Promise<StaffMember> {
  return createBrowserApiClient().postData<StaffMember>('staff/update', body);
}

export async function disableStaff(id: string): Promise<StaffMember> {
  return createBrowserApiClient().postData<StaffMember>('staff/disable', { id });
}

export async function listRoles(): Promise<Role[]> {
  return createBrowserApiClient().getData<Role[]>('roles/list');
}

export async function createRole(body: {
  name: string;
  description?: string;
  permissions: string[];
}): Promise<Role> {
  return createBrowserApiClient().postData<Role>('roles/create', body);
}

export async function updateRole(body: {
  id: string;
  name?: string;
  description?: string;
  permissions?: string[];
}): Promise<Role> {
  return createBrowserApiClient().postData<Role>('roles/update', body);
}

export async function deleteRole(id: string): Promise<void> {
  await createBrowserApiClient().postData('roles/delete', { id });
}

export async function duplicateRole(id: string): Promise<Role> {
  return createBrowserApiClient().postData<Role>('roles/duplicate', { id });
}

export async function listPermissions(): Promise<Permission[]> {
  return createBrowserApiClient().getData<Permission[]>('permissions');
}
