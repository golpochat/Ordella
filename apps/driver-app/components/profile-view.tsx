'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared-ui';
import { useDriverSession } from '@/hooks/use-driver-session';
import { fetchDriverProfile, updateDriverProfile } from '@/lib/api';
import { clearSession, setSession, statusLabel, type DriverStatus } from '@/lib/session';

export function ProfileView() {
  const router = useRouter();
  const { session, setSession: setSessionState } = useDriverSession();
  const [vehicleType, setVehicleType] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.driverId) return;
    void fetchDriverProfile(session.driverId)
      .then((profile) => {
        setVehicleType(profile.vehicleType);
        setPhone(profile.phone);
      })
      .catch(() => {
        /* profile endpoint may be unimplemented */
      });
  }, [session?.driverId]);

  const updateStatus = async (status: DriverStatus) => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      await updateDriverProfile(session.driverId, { status });
      const next = { ...session, status };
      setSession(next);
      setSessionState(next);
    } catch (e) {
      const next = { ...session, status };
      setSession(next);
      setSessionState(next);
    } finally {
      setSaving(false);
    }
  };

  const signOut = () => {
    clearSession();
    router.replace('/login');
  };

  if (!session) {
    return <p className="p-4 text-sm text-muted-foreground">No session loaded.</p>;
  }

  return (
    <div className="space-y-4 p-4 pb-24">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Driver account and availability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{session.driverName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Driver ID: {session.driverId || '—'}</p>
          <p>Tenant: {session.tenantId || '—'}</p>
          {phone ? <p>Phone: {phone}</p> : null}
          {vehicleType ? <p>Vehicle: {vehicleType}</p> : null}
          <p>Status: {statusLabel(session.status)}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue={session.status}>
        <TabsList className="w-full">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="busy">Busy</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
        </TabsList>
        <TabsContent value="available" className="mt-3">
          <Button disabled={saving} onClick={() => void updateStatus('available')}>
            Set available
          </Button>
        </TabsContent>
        <TabsContent value="busy" className="mt-3">
          <Button disabled={saving} variant="secondary" onClick={() => void updateStatus('busy')}>
            Set busy
          </Button>
        </TabsContent>
        <TabsContent value="offline" className="mt-3">
          <Button disabled={saving} variant="outline" onClick={() => void updateStatus('offline')}>
            Go offline
          </Button>
        </TabsContent>
      </Tabs>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button variant="destructive" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
