'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from '@/lib/api';
import {
  createAddressSchema,
  type CreateAddressInput,
  type CustomerAddress,
} from '@/lib/schemas/address';

const emptyForm: CreateAddressInput = {
  label: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  instructions: '',
  isDefault: false,
};

export function AddressesView() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<CreateAddressInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    void fetchAddresses()
      .then(setAddresses)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load addresses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsed = createAddressSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Invalid address');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, parsed.data);
      } else {
        await createAddress(parsed.data);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      postalCode: address.postalCode ?? '',
      instructions: address.instructions ?? '',
      isDefault: address.isDefault,
    });
  };

  const onDelete = async (addressId: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteAddress(addressId);
      if (editingId === addressId) {
        setEditingId(null);
        setForm(emptyForm);
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Addresses</h1>
        <p className="text-sm text-muted-foreground">Saved delivery locations</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading addresses…</p> : null}

      <div className="space-y-3">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {address.label}
                {address.isDefault ? ' · Default' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ''}
              </p>
              <p>
                {address.city}
                {address.postalCode ? ` ${address.postalCode}` : ''}
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => onEdit(address)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={saving}
                  onClick={() => void onDelete(address.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? 'Edit address' : 'Add address'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <div className="space-y-1">
              <label htmlFor="label" className="text-sm font-medium">
                Label
              </label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="addressLine1" className="text-sm font-medium">
                Address line 1
              </label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="addressLine2" className="text-sm font-medium">
                Address line 2
              </label>
              <Input
                id="addressLine2"
                value={form.addressLine2 ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="postalCode" className="text-sm font-medium">
                Postal code
              </label>
              <Input
                id="postalCode"
                value={form.postalCode ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="instructions" className="text-sm font-medium">
                Instructions
              </label>
              <textarea
                id="instructions"
                className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm"
                value={form.instructions ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              />
              Default address
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add address'}
              </Button>
              {editingId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/profile">Back to profile</Link>
      </Button>
    </div>
  );
}
