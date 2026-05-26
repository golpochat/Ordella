'use client';

import { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';
import {
  deleteSavedBasket,
  deleteSavedItem,
  fetchSavedBaskets,
  fetchSavedItems,
  saveCustomerBasket,
  saveCustomerItem,
  type CustomerSavedBasket,
  type CustomerSavedItem,
} from '@/lib/api';
import { useTenantSettings } from '@/hooks/use-tenant-settings';

export function SavedView() {
  const { formatCurrency } = useTenantSettings();
  const [baskets, setBaskets] = useState<CustomerSavedBasket[]>([]);
  const [items, setItems] = useState<CustomerSavedItem[]>([]);
  const [basketName, setBasketName] = useState('');
  const [itemProductId, setItemProductId] = useState('');
  const [itemLabel, setItemLabel] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    void Promise.all([fetchSavedBaskets(), fetchSavedItems()])
      .then(([basketRows, itemRows]) => {
        setBaskets(basketRows);
        setItems(itemRows);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load saved account data'));
  };

  useEffect(load, []);

  const createBasket = async () => {
    setError(null);
    setMessage(null);
    try {
      const saved = await saveCustomerBasket({
        name: basketName.trim() || 'Saved basket',
        items: [],
      });
      setBaskets((current) => [saved, ...current]);
      setBasketName('');
      setMessage('Saved basket created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save basket');
    }
  };

  const createItem = async () => {
    setError(null);
    setMessage(null);
    try {
      const saved = await saveCustomerItem({
        productId: itemProductId,
        label: itemLabel.trim() || undefined,
      });
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setItemProductId('');
      setItemLabel('');
      setMessage('Saved item added.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save item');
    }
  };

  const removeBasket = async (basketId: string) => {
    await deleteSavedBasket(basketId);
    setBaskets((current) => current.filter((basket) => basket.id !== basketId));
  };

  const removeItem = async (itemId: string) => {
    await deleteSavedItem(itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Saved</h1>
        <p className="text-sm text-muted-foreground">Saved baskets and favourite items for faster checkout</p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved baskets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Basket name"
              value={basketName}
              onChange={(event) => setBasketName(event.target.value)}
            />
            <Button type="button" onClick={() => void createBasket()}>
              Save
            </Button>
          </div>
          {baskets.map((basket) => (
            <div key={basket.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{basket.name}</p>
                <p className="text-muted-foreground">
                  {basket.itemCount} items · {formatCurrency(basket.subtotal)} {basket.currency}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => void removeBasket(basket.id)}>
                Remove
              </Button>
            </div>
          ))}
          {!baskets.length ? <p className="text-sm text-muted-foreground">No saved baskets yet.</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Product ID"
            value={itemProductId}
            onChange={(event) => setItemProductId(event.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Label (optional)"
              value={itemLabel}
              onChange={(event) => setItemLabel(event.target.value)}
            />
            <Button type="button" onClick={() => void createItem()} disabled={!itemProductId}>
              Save
            </Button>
          </div>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{item.label ?? 'Saved item'}</p>
                <p className="text-muted-foreground">{item.productId}</p>
              </div>
              <Button type="button" variant="outline" onClick={() => void removeItem(item.id)}>
                Remove
              </Button>
            </div>
          ))}
          {!items.length ? <p className="text-sm text-muted-foreground">No saved items yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
