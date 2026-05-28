'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Stack,
} from '@shared-ui';
import type { AdminModifier } from '@/lib/api/admin/products';
import { createBrowserApiClient } from '@/lib/api/browser';
import { addModifierOption, createModifier } from '@/lib/api/admin/products';
import { getErrorMessage } from '@/lib/utils';

export function ModifiersPanel({ modifiers }: { modifiers: AdminModifier[] }) {
  const router = useRouter();
  const [modifierName, setModifierName] = useState('');
  const [optionModifierId, setOptionModifierId] = useState('');
  const [optionName, setOptionName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onCreateModifier(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createModifier(createBrowserApiClient(), { name: modifierName });
      setModifierName('');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function onAddOption(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addModifierOption(createBrowserApiClient(), optionModifierId, { name: optionName });
      setOptionName('');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New modifier group</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2" onSubmit={onCreateModifier}>
            <Input
              className="max-w-xs"
              placeholder="Modifier name"
              value={modifierName}
              onChange={(e) => setModifierName(e.target.value)}
              required
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add option</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2" onSubmit={onAddOption}>
            <Select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={optionModifierId}
              onChange={(e) => setOptionModifierId(e.target.value)}
              required
            >
              <option value="">Modifier…</option>
              {modifiers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
            <Input
              className="max-w-xs"
              placeholder="Option name"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              required
            />
            <Button type="submit">Add option</Button>
          </form>
          {error ? <FormErrorAlert message={error} /> : null}
        </CardContent>
      </Card>
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Modifier</TableHead>
            <TableHead>Options</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {modifiers.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>
                {(m.options ?? []).map((o) => o.name).join(', ') || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
