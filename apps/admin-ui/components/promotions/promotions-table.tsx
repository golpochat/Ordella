import Link from 'next/link';
import type { Promotion } from '@shared-utils';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import { PromotionActions } from './promotion-actions';

export function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Validity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {promotions.map((promo) => (
          <TableRow key={promo.id}>
            <TableCell className="font-medium">{promo.name}</TableCell>
            <TableCell>{promo.type}</TableCell>
            <TableCell>{promo.value}</TableCell>
            <TableCell>{promo.channel ?? 'both'}</TableCell>
            <TableCell>
              {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Now'}
              {' - '}
              {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'No end'}
            </TableCell>
            <TableCell>
              <Badge variant={promo.isActive ? 'default' : 'secondary'}>
                {promo.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/promotions/${promo.id}/edit`}>Edit</Link>
                </Button>
                <PromotionActions promotion={promo} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
