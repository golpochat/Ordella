'use client';

import { FormErrorAlert } from '@/components/ui/admin-form-validation';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@shared-utils';
import { Select, Button, Card, CardContent, CardHeader, CardTitle, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createCategory } from '@/lib/api/admin/products';
import { listTaxCategories, type TaxCategory } from '@/lib/api/admin/tax';
import { getErrorMessage } from '@/lib/utils';

export function CategoriesPanel({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [name, setName] = useState('');
  const [taxCategoryId, setTaxCategoryId] = useState('');
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTaxCategories(api)
      .then(setTaxCategories)
      .catch((err) => setError(getErrorMessage(err)));
  }, [api]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory(api, { name, taxCategoryId: taxCategoryId || undefined });
      setName('');
      setTaxCategoryId('');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Stack gap="lg" className="min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-2" onSubmit={onCreate}>
            <Input
              className="max-w-xs"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={taxCategoryId}
              onChange={(e) => setTaxCategoryId(e.target.value)}
            >
              <option value="">Default tax category</option>
              {taxCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Button type="submit">Create</Button>
          </form>
          {error ? <FormErrorAlert message={error} /> : null}
        </CardContent>
      </Card>
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sort order</TableHead>
            <TableHead>Tax category</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {categories.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.sortOrder}</TableCell>
              <TableCell>
                {taxCategories.find((category) => category.id === c.taxCategoryId)?.name ?? 'Tenant default'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
