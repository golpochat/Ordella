import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared-ui';
import { formatDate } from '@/lib/utils';
import type { DeveloperWebhookLog } from '@/lib/api/admin/developer';

export function WebhookLogsTable({ logs }: { logs: DeveloperWebhookLog[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Attempt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
                <TableCell>{log.eventType}</TableCell>
                <TableCell>{log.attempt}</TableCell>
                <TableCell>
                  <Badge variant={log.success ? 'outline' : 'destructive'}>
                    {log.statusCode ?? 'Failed'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">{log.responseBody ?? 'No response'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
