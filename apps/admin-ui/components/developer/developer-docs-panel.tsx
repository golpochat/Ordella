import { Card, CardContent, CardHeader, CardTitle } from '@shared-ui';

const exampleCurl = `curl -H "Authorization: Bearer ord_live_xxx" \\
  https://api.ordella.local/api/v1/api/orders`;

const exampleJs = `const res = await fetch('/api/v1/api/catalog', {
  headers: { Authorization: \`Bearer \${process.env.ORDELLA_API_KEY}\` },
});`;

const examplePython = `import requests
requests.get(
  "https://api.ordella.local/api/v1/api/inventory",
  headers={"Authorization": f"Bearer {api_key}"},
)`;

const examplePhp = `$client->request('GET', '/api/v1/api/orders', [
  'headers' => ['Authorization' => 'Bearer '.$apiKey],
]);`;

export function DeveloperDocsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Documentation</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2">
          <h3 className="font-medium">Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Send API keys with <code>Authorization: Bearer &lt;key&gt;</code> or <code>x-api-key</code>. Keys are tenant-scoped,
            permission-scoped, optionally IP-restricted, and rate limited per key.
          </p>
        </section>
        <section className="space-y-2">
          <h3 className="font-medium">Endpoints</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>GET /api/orders</li>
            <li>GET /api/orders/:id</li>
            <li>GET /api/catalog</li>
            <li>GET /api/items/:id</li>
            <li>GET /api/inventory</li>
            <li>GET /api/customers</li>
            <li>GET /api/locations</li>
            <li>GET /developer/openapi.json</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h3 className="font-medium">Webhook Events</h3>
          <p className="text-sm text-muted-foreground">
            Payloads include <code>X-Ordella-Event</code>, <code>X-Ordella-Event-Id</code>, <code>X-Ordella-Timestamp</code>,
            and <code>X-Ordella-Signature</code>. Verify <code>t.timestamp + "." + rawBody</code> with HMAC SHA-256.
          </p>
        </section>
        <section className="space-y-2">
          <h3 className="font-medium">Rate Limits</h3>
          <p className="text-sm text-muted-foreground">
            Default API keys allow 1000 requests per minute. Higher or lower limits can be configured when keys are created.
          </p>
        </section>
        <section className="space-y-2">
          <h3 className="font-medium">Examples</h3>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{exampleCurl}</pre>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{exampleJs}</pre>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{examplePython}</pre>
          <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{examplePhp}</pre>
        </section>
      </CardContent>
    </Card>
  );
}
