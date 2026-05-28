import { Tag, TagLabel } from '@/components/ui/admin-tag';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { IconButton } from '@shared-ui';
import { formatDate } from '@/lib/utils';
import type { AuditLog } from '@/lib/api/admin/audit-logs';
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

function formatEntity(log: AuditLog): string {
  const label = log.entityType.replaceAll('_', ' ');
  return log.entityId ? `${label} · ${log.entityId.slice(0, 8)}` : label;
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  return (
    <AdminTableShell
      isEmpty={logs.length === 0}
      emptyTitle="No audit logs"
      emptyDescription="Security and compliance events will appear here."
    >
      <Table>
        <TableHeader sticky>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="w-[1%] text-right">Drilldown</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody zebra>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
              <TableCell className="font-mono text-xs">{log.userId?.slice(0, 8) ?? 'System'}</TableCell>
              <TableCell>{log.actorType}</TableCell>
              <TableCell>
                <Tag variant={log.status === 'failed' || log.action.endsWith('.failed') ? 'error' : 'outline'}><TagLabel>
                  {log.action}
                </TagLabel></Tag>
              </TableCell>
              <TableCell>
                <Tag variant={log.riskLevel === 'high' || log.riskLevel === 'critical' ? 'error' : 'neutral'}><TagLabel>
                  {log.riskLevel}
                </TagLabel></Tag>
              </TableCell>
              <TableCell className="capitalize">{formatEntity(log)}</TableCell>
              <TableCell className="font-mono text-xs">{log.locationId?.slice(0, 8) ?? 'All'}</TableCell>
              <TableCell>
                <details className="max-w-xl">
                  <summary className="cursor-pointer text-sm text-primary">View metadata</summary>
                  <div className="mt-2 space-y-2 rounded-md border border-border bg-muted/40 p-3">
                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <span>IP: {log.ipAddress ?? 'Unknown'}</span>
                      <span>User agent: {log.userAgent ?? 'Unknown'}</span>
                      <span>Source: {log.source}</span>
                      <span>Status: {log.status}</span>
                      <span>Hash: {log.hash ?? 'Pending'}</span>
                      <span>
                        Retention until: {log.retentionUntil ? formatDate(log.retentionUntil) : 'Default policy'}
                      </span>
                    </div>
                    <pre className="max-h-72 overflow-auto text-xs">{prettyJson(log.metadata)}</pre>
                  </div>
                </details>
              </TableCell>
              <TableCell className="text-right">
                <TableActions>
                  <IconButton size="sm" aria-label="Open audit log detail" asChild>
                    <Link href={`/audit-logs/${log.id}`}>
                      <ExternalLink className="h-4 w-4" />
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
