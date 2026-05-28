'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Product } from '@shared-utils';
import { createBrowserApiClient } from '@/lib/api/browser';
import { createProduct, updateProduct } from '@/lib/api/admin/products';
import { listTaxCategories, type TaxCategory } from '@/lib/api/admin/tax';
import { getErrorMessage } from '@/lib/utils';
import {
  Button,
  FormActions,
  FormField,
  FormLayout,
  Grid,
  Input,
  Select,
  Textarea,
  FormErrorAlert,
} from '@/components/ui/admin-form';

type ProductFormProps = {
  categories: Category[];
  product?: Product;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const baseId = useId();
  const router = useRouter();
  const api = useMemo(() => createBrowserApiClient(), []);
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [taxCategoryId, setTaxCategoryId] = useState(product?.taxCategoryId ?? '');
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [status, setStatus] = useState(product?.status ?? 'active');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listTaxCategories(api)
      .then(setTaxCategories)
      .catch((err) => setError(getErrorMessage(err)));
  }, [api]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = {
      name,
      description: description || undefined,
      price,
      categoryId: categoryId || undefined,
      taxCategoryId: taxCategoryId || undefined,
      status,
    };

    try {
      if (product) {
        await updateProduct(api, product.id, body);
        router.push('/products');
      } else {
        await createProduct(api, body);
        router.push('/products');
      }
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FormLayout>
        <FormErrorAlert message={error} title="Unable to save product" />
        <Grid cols={1} gap="md" className="min-[769px]:grid-cols-2">
          <FormField label="Name" htmlFor={`${baseId}-name`} required className="min-[769px]:col-span-2">
            <Input id={`${baseId}-name`} required value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>

          <FormField
            label="Tax category"
            htmlFor={`${baseId}-tax`}
            helper="Leave empty to inherit from product category."
          >
            <Select
              id={`${baseId}-tax`}
              value={taxCategoryId}
              onChange={(e) => setTaxCategoryId(e.target.value)}
            >
              <option value="">Inherit from product category</option>
              {taxCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Category" htmlFor={`${baseId}-category`}>
            <Select
              id={`${baseId}-category`}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Status" htmlFor={`${baseId}-status`}>
            <Select
              id={`${baseId}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value as Product['status'])}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </FormField>

          <FormField label="Price" htmlFor={`${baseId}-price`} required>
            <Input
              id={`${baseId}-price`}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="tabular-nums"
            />
          </FormField>
        </Grid>

        <FormField label="Description" htmlFor={`${baseId}-description`} className="min-w-0">
          <Textarea
            id={`${baseId}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24"
          />
        </FormField>

        <FormActions>
          <Button type="submit" isLoading={loading} loadingLabel="Saving…">
            {product ? 'Save changes' : 'Create product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </FormActions>
      </FormLayout>
    </form>
  );
}
