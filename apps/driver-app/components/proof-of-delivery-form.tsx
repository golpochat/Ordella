'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@shared-ui';

type ProofOfDeliveryFormProps = {
  onNotesChange: (notes: string) => void;
};

export function ProofOfDeliveryForm({ onNotesChange }: ProofOfDeliveryFormProps) {
  const [photoSelected, setPhotoSelected] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Proof of delivery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="pod-photo" className="text-sm font-medium">
            Delivery photo
          </label>
          <Input
            id="pod-photo"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhotoSelected(Boolean(e.target.files?.length))}
          />
          <p className="text-xs text-muted-foreground">
            {photoSelected ? 'Photo selected (upload placeholder)' : 'Photo upload coming soon'}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Customer signature</p>
          <div className="flex h-28 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
            Signature pad placeholder
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSignatureCaptured(true)}
          >
            {signatureCaptured ? 'Signature captured' : 'Capture signature'}
          </Button>
        </div>

        <div className="space-y-2">
          <label htmlFor="pod-notes" className="text-sm font-medium">
            Notes
          </label>
          <textarea
            id="pod-notes"
            className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm"
            placeholder="Gate code, left at door, etc."
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
