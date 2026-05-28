import { Tag, TagLabel } from '@/components/ui/admin-tag';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { Product } from '@shared-utils';
import { IconButton } from '@shared-ui';
import { formatMoney } from '@/lib/utils';
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

export function ProductsTable({ products }: { products: Product[] }) {
  return (
    <AdminTableShell
      isEmpty={products.length === 0}
      emptyTitle="No products"
      emptyDescription="Create your first product to get started."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right tabular-nums">Price</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Tag variant={product.status === 'active' ? 'brand' : 'neutral'}><TagLabel>
                  {product.status}
                </TagLabel></Tag>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatMoney(product.price)}</TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <IconButton size="sm" aria-label={`Edit ${product.name}`} asChild>
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </IconButton>
                </TableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
