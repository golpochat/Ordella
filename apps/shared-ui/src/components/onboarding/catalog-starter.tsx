import { Button } from '../button';
import { Input } from '../input';
import { cn } from '../../lib/utils';

export type CatalogStarterValues = {
  categoryName: string;
  itemName: string;
  price: string;
};

export type CatalogStarterProps = {
  values: CatalogStarterValues;
  onChange: (patch: Partial<CatalogStarterValues>) => void;
  onImportSample?: () => void;
  importLoading?: boolean;
  className?: string;
};

export function CatalogStarter({
  values,
  onChange,
  onImportSample,
  importLoading,
  className,
}: CatalogStarterProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {onImportSample ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Import a mixed retail sample catalog (grocery, café, apparel, and more) to explore
            Ordella quickly.
          </p>
          <Button type="button" variant="outline" onClick={onImportSample} disabled={importLoading}>
            {importLoading ? 'Importing…' : 'Import sample catalog'}
          </Button>
        </div>
      ) : null}
      <div className="space-y-4">
        <p className="text-sm font-medium">Or create your first item</p>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="categoryName">
            Category name
          </label>
          <Input
            id="categoryName"
            value={values.categoryName}
            onChange={(e) => onChange({ categoryName: e.target.value })}
            placeholder="e.g. Essentials"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="itemName">
            Item name
          </label>
          <Input
            id="itemName"
            value={values.itemName}
            onChange={(e) => onChange({ itemName: e.target.value })}
            placeholder="e.g. Tote bag"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="price">
            Price
          </label>
          <Input
            id="price"
            value={values.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="9.99"
          />
        </div>
      </div>
    </div>
  );
}
