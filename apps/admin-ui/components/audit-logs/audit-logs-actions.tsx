'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Card, CardContent } from '@shared-ui';
import { createBrowserApiClient } from '@/lib/api/browser';
import { exportAuditLogsCsv, fetchComplianceStatus, listAuditAlerts } from '@/lib/api/admin/audit-logs';

export function AuditLogsActions() {
  const { success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo } = useAdminToast();

  const searchParams = useSearchParams();
  
  async function exportCsv() {
    const csv = await exportAuditLogsCsv(createBrowserApiClient(), Object.fromEntries(searchParams.entries()));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-logs.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function checkCompliance() {
    const [status, alerts] = await Promise.all([
      fetchComplianceStatus(createBrowserApiClient()),
      listAuditAlerts(createBrowserApiClient()),
    ]);
    const statusText = typeof status === 'object' && status && 'tamperEvidenceVerified' in status
      ? `Tamper evidence verified: ${String((status as { tamperEvidenceVerified?: unknown }).tamperEvidenceVerified)}`
      : 'Compliance status loaded';
    toastSuccess(`${statusText}. Active alerts: ${alerts.length}.`);
  }

  return (
    <Card className="mb-4">
      <CardContent className="flex flex-wrap items-center gap-2 p-4">
        <Button type="button" variant="outline" onClick={() => void exportCsv()}>
          Export CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => void checkCompliance()}>
          Check compliance & alerts
        </Button>
        </CardContent>
    </Card>
  );
}
