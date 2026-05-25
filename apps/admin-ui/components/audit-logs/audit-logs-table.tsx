import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatDate } from '@/lib/utils';
import type { AuditLog } from '@/lib/api/admin/audit-logs';

function formatEntity(log: AuditLog): string {
  const label = log.entityType.replaceAll('_', ' ');
  return log.entityId ? `${label} · ${log.entityId.slice(0, 8)}` : label;
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
            <TableCell className="font-mono text-xs">{log.userId?.slice(0, 8) ?? 'System'}</TableCell>
            <TableCell>
              <Badge variant={log.action.endsWith('.failed') ? 'destructive' : 'outline'}>
                {log.action}
              </Badge>
            </TableCell>
            <TableCell className="capitalize">{formatEntity(log)}</TableCell>
            <TableCell className="font-mono text-xs">{log.locationId?.slice(0, 8) ?? 'All'}</TableCell>
            <TableCell>
              <details className="max-w-xl">
                <summary className="cursor-pointer text-sm text-primary">View metadata</summary>
                <div className="mt-2 space-y-2 rounded-md border bg-muted/40 p-3">
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    <span>IP: {log.ipAddress ?? 'Unknown'}</span>
                    <span>User agent: {log.userAgent ?? 'Unknown'}</span>
                  </div>
                  <pre className="max-h-72 overflow-auto text-xs">{prettyJson(log.metadata)}</pre>
                </div>
              </details>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
