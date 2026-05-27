# Developer Onboarding — Quickstart Guides

Language-specific **Hello Ordella** examples. Prerequisites for all: [ACCOUNT_CREATION](./ACCOUNT_CREATION.md), [SANDBOX_SETUP](./SANDBOX_SETUP.md), [API_KEYS](./API_KEYS.md). Base URL: `https://api.ordella.com/v1`.

**Related:** [FIRST_API_CALL.md](./FIRST_API_CALL.md) · [SDK overview](../docs/public/developers/sdk-overview.md) · [API overview](../docs/public/developers/api-overview.md)

Set environment variables (never commit secrets):

```bash
export ORDELLA_API_KEY="ord_sandbox_xxxxxxxx"
export ORDELLA_TENANT_ID="ten_sandbox_xxxxxxxx"
export ORDELLA_BASE_URL="https://api.ordella.com/v1"
```

---

## cURL quickstart

Fastest proof without dependencies—matches [FIRST_API_CALL](./FIRST_API_CALL.md).

```bash
curl -sS "${ORDELLA_BASE_URL}/products?limit=5" \
  -H "Authorization: Bearer ${ORDELLA_API_KEY}" \
  -H "X-Tenant-Id: ${ORDELLA_TENANT_ID}" \
  -H "Accept: application/json" | jq .
```

Expect HTTP `200` and JSON `data` array. Use `-v` for TLS/debug headers.

---

## Node.js quickstart

Server-side (Node 18+). Install HTTP client: `npm install` (native `fetch` shown).

```javascript
const baseUrl = process.env.ORDELLA_BASE_URL;
const apiKey = process.env.ORDELLA_API_KEY;
const tenantId = process.env.ORDELLA_TENANT_ID;

async function listProducts() {
  const res = await fetch(`${baseUrl}/products?limit=5`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Tenant-Id": tenantId,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ordella API ${res.status}: ${err}`);
  }
  return res.json();
}

listProducts()
  .then((body) => console.log(JSON.stringify(body, null, 2)))
  .catch(console.error);
```

Official SDK: see [SDK overview](../docs/public/developers/sdk-overview.md) when package name is published (`@ordella/sdk` placeholder).

---

## Python quickstart

Python 3.10+ with `httpx` or `requests`. Example uses `httpx`:

```bash
pip install httpx
```

```python
import os
import httpx

BASE_URL = os.environ["ORDELLA_BASE_URL"]
API_KEY = os.environ["ORDELLA_API_KEY"]
TENANT_ID = os.environ["ORDELLA_TENANT_ID"]

def list_products():
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "X-Tenant-Id": TENANT_ID,
        "Accept": "application/json",
    }
    with httpx.Client(timeout=30.0) as client:
        r = client.get(f"{BASE_URL}/products", params={"limit": 5}, headers=headers)
        r.raise_for_status()
        return r.json()

if __name__ == "__main__":
    print(list_products())
```

---

## PHP quickstart

PHP 8.2+ with cURL extension:

```php
<?php
$baseUrl = getenv('ORDELLA_BASE_URL');
$apiKey = getenv('ORDELLA_API_KEY');
$tenantId = getenv('ORDELLA_TENANT_ID');

$ch = curl_init("{$baseUrl}/products?limit=5");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer {$apiKey}",
        "X-Tenant-Id: {$tenantId}",
        "Accept: application/json",
    ],
]);
$response = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status !== 200) {
    throw new RuntimeException("Ordella API HTTP {$status}: {$response}");
}
echo $response;
```

---

## Go quickstart

Go 1.21+ standard library:

```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

func main() {
	baseURL := os.Getenv("ORDELLA_BASE_URL")
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/products?limit=5", nil)
	req.Header.Set("Authorization", "Bearer "+os.Getenv("ORDELLA_API_KEY"))
	req.Header.Set("X-Tenant-Id", os.Getenv("ORDELLA_TENANT_ID"))
	req.Header.Set("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		panic(fmt.Sprintf("Ordella API %d: %s", res.StatusCode, body))
	}
	var parsed map[string]any
	_ = json.Unmarshal(body, &parsed)
	fmt.Printf("%#v\n", parsed)
}
```

---

## Webhook verification quick links

After REST works, add handlers using [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) signature examples (Node/Python).

---

## Next steps

| Goal | Doc |
|------|-----|
| Webhooks | [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) |
| OAuth app | [APP_CREATION.md](./APP_CREATION.md) |
| POS / storefront | [POS guide](../docs/public/guides/pos-integration.md) · [Storefront](../docs/public/guides/storefront-integration.md) |
| Monitoring | [LOGS_AND_USAGE.md](./LOGS_AND_USAGE.md) |
| Full reference | [API reference](../docs/public/api-reference.md) |

**Portal:** [Dashboard](../developer-portal/pages/dashboard.md) · [API keys](../developer-portal/pages/api-keys.md)
