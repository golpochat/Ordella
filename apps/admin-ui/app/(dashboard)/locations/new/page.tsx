'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { PageHeader } from '@shared-ui';
import { createLocation } from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';
import {
  Button,
  Card,
  CardContent,
  FormErrorAlert,
  FormActions,
  FormField,
  FormLayout,
  Grid,
  Input,
  PageSection,
  Stack,
} from '@/components/ui/admin-form';

export default function NewLocationPage() {
  const baseId = useId();
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
    <Stack gap="lg" className="min-w-0">
      <PageHeader title="Add location" description="Create a new site for your business." />

      <PageSection title="Details">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={onSubmit}>
              <FormLayout>
                <Grid cols={1} gap="md" className="min-[769px]:grid-cols-2">
                  <FormField label="Name" htmlFor={`${baseId}-name`} required className="min-[769px]:col-span-2">
                    <Input
                      id={`${baseId}-name`}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Address" htmlFor={`${baseId}-address`} className="min-[769px]:col-span-2">
                    <Input
                      id={`${baseId}-address`}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Phone" htmlFor={`${baseId}-phone`}>
                    <Input
                      id={`${baseId}-phone`}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Timezone" htmlFor={`${baseId}-timezone`} helper="IANA timezone, e.g. Europe/Dublin.">
                    <Input
                      id={`${baseId}-timezone`}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </FormField>
                  <FormField label="Currency" htmlFor={`${baseId}-currency`} helper="ISO 4217 code, e.g. EUR.">
                    <Input
                      id={`${baseId}-currency`}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    />
                  </FormField>
                </Grid>

                <FormErrorAlert message={error} title="Unable to create location" />

                <FormActions>
                  <Button type="submit" isLoading={loading} loadingLabel="Creating…">
                    Create location
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/locations">Cancel</Link>
                  </Button>
                </FormActions>
              </FormLayout>
            </form>
          </CardContent>
        </Card>
      </PageSection>
    </Stack>
  );
}
