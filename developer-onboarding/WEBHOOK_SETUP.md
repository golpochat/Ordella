# Developer Onboarding — Webhook Setup

Register an HTTPS endpoint, verify signed deliveries, test handlers, and inspect logs. Essential for event-driven integrations on the [Event Bus](../docs/public/systems/event-bus.md).

**Related:** [Webhook management](../developer-portal/sections/webhook-management.md) · [Webhooks page](../developer-portal/pages/webhooks.md) · [Public webhooks doc](../docs/public/developers/webhooks.md)

---

## Registering a webhook

1. Open [Webhooks](../developer-portal/pages/webhooks.md) in the Developer Portal.  
2. Click **Add endpoint**.  
3. Enter **HTTPS URL** (public URL or dev tunnel such as ngrok—placeholder).  
4. Select **event types** (start with one, e.g. `order.created` or `inventory.adjusted`—confirm names in [API reference](../docs/public/api-reference.md)).  
5. Save; copy **signing secret** shown once (or rotate from endpoint detail).  
6. Ensure sandbox scope: deliveries tagged **sandbox** per [sandbox-overview](../developer-portal/sections/sandbox-overview.md).

One endpoint may subscribe to multiple topics; use separate endpoints for isolation in production if desired.

---

## Testing webhook delivery

### Portal test event

Use **Send test event** on the endpoint card ([webhook-management](../developer-portal/sections/webhook-management.md)). Expect HTTP `2xx` from your server within timeout (default **30s** placeholder).

### Trigger via API

Perform sandbox action that emits the event—e.g., create test order after [FIRST_API_CALL](./FIRST_API_CALL.md) write scopes enabled.

### Local development

Run listener on `localhost` via tunnel:

```bash
# Example: forward https://abc123.ngrok.io -> localhost:3000/webhooks/ordella
```

Register tunnel URL in portal; restart tunnel updates URL—update endpoint when URL changes.

---

## Verifying signatures

Verify **before** parsing body or executing side effects. Header name placeholder: `X-Ordella-Signature` (confirm in [Webhooks doc](../docs/public/developers/webhooks.md)).

### Algorithm (placeholder)

HMAC-SHA256 over raw request body using signing secret; compare with constant-time equality.

### Node.js example (text)

```javascript
const crypto = require("crypto");

function verifyOrdellaSignature(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const received = signatureHeader.replace(/^sha256=/, "");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(received, "hex")
  );
}
```

### Python example (text)

```python
import hmac
import hashlib

def verify_ordella_signature(raw_body: bytes, signature_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    received = signature_header.removeprefix("sha256=")
    return hmac.compare_digest(expected, received)
```

Reject requests failing verification with `401`—do not process payload.

**Idempotency:** store event ID (e.g., `event.id` in payload) and skip duplicates—retries are normal ([Event flow](../docs/public/architecture/event-flow.md)).

---

## Viewing webhook logs

1. Open [Logs](../developer-portal/pages/logs.md) → filter **Webhooks**.  
2. Inspect per delivery: status code, latency, payload size, retry count.  
3. Use **request ID** / **delivery ID** when filing support tickets ([FEEDBACK_LOOP](../beta-program/FEEDBACK_LOOP.md)).

Failed deliveries (`4xx`/`5xx`/timeout) retry with exponential backoff (placeholder)—fix handler, then use **retry** action in portal if available.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| No deliveries | Subscription topics match emitted events; sandbox tenant active |
| `401` on verify | Raw body must be unmodified string; no JSON re-serialization before HMAC |
| Timeouts | Respond `2xx` quickly; process async via queue |
| SSL errors | Valid public cert on endpoint; no self-signed in production |

---

## Next steps

- [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md)  
- [APP_CREATION.md](./APP_CREATION.md) if app receives webhooks for installs  
- [Partner integration guide](../docs/public/guides/partner-integration.md)
