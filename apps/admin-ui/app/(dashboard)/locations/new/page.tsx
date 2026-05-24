'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import { createLocation } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

export default function NewLocationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('Europe/Dublin');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await createLocation({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        timezone: timezone.trim() || undefined,
        currency: currency.trim() || undefined,
        status: 'open',
      });
      router.push(`/locations/${created.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Add location</h1>
        <p className="text-sm text-muted-foreground">Create a new site for your business.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input placeholder="Name *" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <Input placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create location'}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/locations">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
