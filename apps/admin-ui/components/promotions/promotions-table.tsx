import { Tag, TagLabel } from '@/components/ui/admin-tag';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { Promotion } from '@shared-utils';
import { IconButton } from '@shared-ui';
import { PromotionActions } from './promotion-actions';
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

export function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
  return (
    <AdminTableShell
      isEmpty={promotions.length === 0}
      emptyTitle="No promotions"
      emptyDescription="Create a promotion to drive sales."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right tabular-nums">Value</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Rules</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[1%] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {promotions.map((promo) => (
            <TableRow key={promo.id}>
              <TableCell className="font-medium">{promo.name}</TableCell>
              <TableCell>{promo.type}</TableCell>
              <TableCell className="text-right tabular-nums">{promo.value}</TableCell>
              <TableCell>{promo.channel ?? 'both'}</TableCell>
              <TableCell>
                P{promo.priority ?? 100}
                {promo.stackable ? ' · stackable' : ' · best price'}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Now'}
                {' – '}
                {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'No end'}
              </TableCell>
              <TableCell>
                <Tag variant={promo.isActive ? 'brand' : 'neutral'}><TagLabel>
                  {promo.isActive ? 'Active' : 'Inactive'}
                </TagLabel></Tag>
              </TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <IconButton size="sm" aria-label={`Edit ${promo.name}`} asChild>
                    <Link href={`/promotions/${promo.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </IconButton>
                  <PromotionActions promotion={promo} />
                </TableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
