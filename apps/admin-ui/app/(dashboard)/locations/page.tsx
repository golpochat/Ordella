'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared-ui';
import {
  disableLocation,
  fetchLocations,
  type LocationListItem,
} from '@/lib/api/locations';
import { getErrorMessage } from '@/lib/utils';

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLocations(await fetchLocations());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Locations</h1>
          <p className="text-sm text-muted-foreground">
            Manage sites for your business — shops, kitchens, warehouses, and pickup points.
          </p>
        </div>
        <Button asChild>
          <Link href="/locations/new">Add location</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All locations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : locations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No locations yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">{loc.name}</TableCell>
                    <TableCell>{loc.address ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={loc.isActive ? 'default' : 'secondary'}>
                        {loc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{loc.staffCount}</TableCell>
                    <TableCell>
                      {loc.inventoryStatus === 'low_stock' ? (
                        <Badge variant="destructive">Low stock ({loc.lowStockCount})</Badge>
                      ) : loc.inventoryStatus === 'empty' ? (
                        <span className="text-muted-foreground">No stock</span>
                      ) : (
                        <span>OK</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/locations/${loc.id}`}>Edit</Link>
                      </Button>
                      {loc.isActive ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            void disableLocation(loc.id).then(load);
                          }}
                        >
                          Disable
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
