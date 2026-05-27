# Ordella Voice and Tone

How Ordella speaks in product UI, marketing, documentation, support, and sales. This file extends [public docs tone](../docs/public/_config/tone.md) for all brand touchpoints.

**Related:** [Brand Overview](./BRAND_OVERVIEW.md) · [Messaging Pillars](./MESSAGING_PILLARS.md) · [Public docs tone.md](../docs/public/_config/tone.md)

---

## Voice principles

<!-- Placeholder: Voice = constant personality; tone = situational adjustment. -->

### 1. Lead with capability

Open with what the reader can do or what the system does—not company history or abstract vision.

**Example:**  
“Configure webhooks to receive signed callbacks when inventory changes.”  
Not: “Ordella is revolutionizing retail with cutting-edge webhook technology.”

### 2. Be precise

Name APIs, permissions, objects, and modules consistently with the product and [Glossary](../docs/public/getting-started/glossary.md).

| Prefer | Avoid |
|--------|--------|
| tenant | account (unless B2B customer-facing) |
| location | store (when meaning Ordella location entity) |
| API key | token (unless JWT specifically) |
| Event Bus | message queue (generic) |

### 3. Be honest

Mark preview, beta, and placeholder content clearly. Do not imply GA availability for roadmap items.

**Example:**  
“This endpoint is in preview; response shapes may change before GA.”

### 4. Be inclusive

Define jargon on first use; link to deeper docs rather than assuming insider knowledge.

### 5. Stay confident, not loud

State outcomes and proof; skip superlatives without evidence.

---

## Tone guidelines

<!-- Placeholder: Adjust tone by context; voice stays the same. -->

| Context | Tone | Notes |
|---------|------|--------|
| **Public docs** | Neutral, instructive | Second person (“you”); present tense for behavior |
| **Developer Portal** | Technical, concise | Code-first; link to API reference |
| **Marketing** | Aspirational but grounded | Problem → platform → proof; see [Messaging Pillars](./MESSAGING_PILLARS.md) |
| **Product UI** | Short, actionable | Labels and errors tell users what to do next |
| **Sales / security** | Formal, evidence-led | Link compliance and architecture docs |
| **Support** | Empathetic, solution-first | Acknowledge impact; give steps |
| **Status / incidents** | Calm, factual | What happened, impact, next update time |

### Person and tense

- **Second person** (“you”) for integrators and operators.  
- **Present tense** for product behavior.  
- **Future tense** only for labeled roadmap or planned items.

### Formatting (docs and long-form)

- Sentence case for headings.  
- One idea per paragraph; ~4 sentences max in introductions.  
- Tables for comparisons; numbered lists for sequences.  
- Monospace for endpoints, headers, JSON (`GET`, `POST`, `X-Tenant-Id`).

---

## Writing style rules

### Headlines and titles

- Product name: **Ordella** (capital O).  
- Tagline on brand moments: **The Retail Operating System**.  
- Sentence case for page titles unless brand lockup requires otherwise.

### Numbers and units

- Spell out one–nine in marketing prose; use numerals for technical specs and metrics.  
- Include units and timezone when stating SLAs or maintenance windows.

### Calls to action

| Use | Avoid |
|-----|--------|
| “Start building” | “Get started now!!!” |
| “View API reference” | “Click here” |
| “Request demo” | “Don’t miss out” |

### Legal and compliance

- Do not overclaim certifications; point to [compliance overview](../docs/public/compliance/soc2-overview.md) and specific program pages.  
- “PCI,” “GDPR,” “SOC 2” only with accurate scope statements.

### Accessibility in copy

- Link text must describe destination (“Read webhook security”), not “here.”  
- Alt text for meaningful images; decorative images marked empty in implementation guides.

---

## Examples: correct vs incorrect tone

### Marketing hero

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “Run store operations, commerce, and intelligence on one platform—connected by a real-time event stream.” | “Ordella will 10x your retail with insane AI magic!” |
| “The Retail Operating System for operators who need one source of truth.” | “The #1 best retail app ever.” |

### Documentation

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “Send `X-Tenant-Id` on every request to scope data to your retailer.” | “Just pass the tenant header like you normally would.” |
| “Webhook signatures use HMAC-SHA256; verify before processing the body.” | “Security is handled automatically.” |

### Product UI — success

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “Inventory updated for 12 locations.” | “Success!!!” |
| “Webhook endpoint verified.” | “Great job!” |

### Product UI — error

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “API key expired. Create a new key in Settings → API keys.” | “Something went wrong.” |
| “Rate limit exceeded. Retry after 60 seconds or upgrade your plan.” | “Error 429.” (without context) |

### Email / lifecycle

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “Your trial ends on 15 June. Export data or upgrade to keep your tenant active.” | “URGENT: Trial ending!!!” |

### Social / short-form

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| “New: Partner API scopes for catalog read—see changelog.” | “🚀🚀 Huge news you can’t miss 🚀🚀” |

---

## Cross-surface consistency

| Surface | Config / entry |
|---------|----------------|
| Public docs | `docs/public/_config/tone.md`, `branding.md` |
| Developer Portal | `developer-portal/sections/` (mirror terminology) |
| Marketing | `apps/marketing` content components |
| Notifications | Admin notification templates (`apps/admin-ui`) — use “Ordella update,” not generic vendor voice |

---

## Review checklist

Before publishing customer-facing copy:

- [ ] Ordella capitalized; tagline used intentionally  
- [ ] Terminology matches glossary and API names  
- [ ] Claims link to docs or changelog where applicable  
- [ ] Preview/beta labeled if applicable  
- [ ] CTAs are specific and accessible  
