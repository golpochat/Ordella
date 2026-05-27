# Ordella Partner Program — Revenue Share

Revenue share models, payout rules, commission structure, and marketplace economics for Ordella partners. **Specific rates are contractual**—this document defines program structure aligned with [public revenue share](../docs/public/partners/revenue-share.md).

**Related:** [Partner tiers](./PARTNER_TIERS.md) · [Partner portal — billing](../developer-portal/sections/billing-overview.md) · [Brand honesty](../brand/VOICE_AND_TONE.md)

---

## Revenue share model

Ordella shares revenue with partners on **qualifying transactions** defined in the partner agreement. Qualifying revenue typically includes:

- **Marketplace subscriptions** — retailer purchases of partner app plans billed through Ordella  
- **Usage attach** — metered usage of partner SKUs linked to Ordella billing (placeholder categories)  
- **Co-sell attach** — new Ordella platform subscriptions attributed via deal registration (Gold+; rules in agreement)  

Non-qualifying: professional services billed directly partner-to-retailer (unless separate SI agreement), pass-through infrastructure fees, taxes, refunds, and chargebacks.

Revenue share is **tier-based**: Silver baseline, Gold enhanced, Platinum custom ([PARTNER_TIERS.md](./PARTNER_TIERS.md)). Registered partners are not eligible until Silver certification and live listing (if applicable).

---

## Partner commission structure (placeholder)

| Tier | Marketplace commission (indicative) | Attach / co-sell (indicative) |
|------|-------------------------------------|----------------------------------|
| **Silver** | `<!-- e.g., 15–20% -->` | Not eligible or limited pilot |
| **Gold** | `<!-- e.g., 20–25% -->` | `<!-- e.g., 5–10% platform attach -->` |
| **Platinum** | Custom volume tiers | Custom |

Percentages apply to **net billings** after refunds, credits, and payment processor fees—per agreement definition. Ordella does not publish binding rates on the marketing site ([website partners copy](../website/copy/partners.md#partner-revenue-share)).

---

## Marketplace revenue share

Marketplace transactions flow: retailer subscribes to partner app → Ordella invoices (or processes) → partner share accrued → statement generated in [Partner portal](./PARTNER_PORTAL.md).

**Rules (summary):**

- Share accrues when payment is **collected**, not on quote or trial start unless trial converts per policy.  
- **Trials:** no commission during free trial; accrual starts on first paid period (placeholder: 14-day trial standard).  
- **Multi-year deals:** commission may be paid on annual cash received vs. TCV—contract specifies.  
- **Bundled Ordella + partner SKUs:** split per SKU mapping table in agreement.  

Partners must maintain **Silver+** certification and active listing for marketplace accrual.

---

## Payout rules

| Topic | Policy (placeholder) |
|-------|----------------------|
| **Schedule** | Monthly arrears, net 30 after statement close (e.g., January activity paid end February) |
| **Minimum payout** | `<!-- e.g., $250 -->` — balances roll forward |
| **Currency** | USD default; local currency where supported and contracted |
| **Method** | ACH, wire, or partner portal payout provider (tax forms required) |
| **Tax** | W-9 / W-8 collection; partner responsible for local tax |
| **Withholding** | Per applicable law |

Statements and export APIs: [Partner portal — billing](./PARTNER_PORTAL.md) · [billing-overview](../developer-portal/sections/billing-overview.md).

---

## Reporting and disputes

Partners access **statements** in portal: gross billings, refunds, commission rate, net payout. Export CSV/API (placeholder) for finance reconciliation.

**Dispute window:** 30 days from statement date—open ticket via partner support with transaction IDs ([SUPPORT_AND_SLAS.md](./SUPPORT_AND_SLAS.md)).

**Adjustments:** chargebacks claw back commission; fraud or ToS violations may forfeit accrued amounts per agreement.

Program changes announced 60 days ahead except legal/tax mandates; see [changelog](../docs/public/changelog.md).

---

## Cross-links

- [Lead distribution](./LEAD_DISTRIBUTION.md) — attribution for co-sell  
- [Co-marketing](./CO_MARKETING.md) — MDF separate from commission unless contracted  
- [Public revenue share](../docs/public/partners/revenue-share.md)  
- [Press FAQ — partners](../press-kit/FAQ.md#how-does-partner-revenue-share-work)
