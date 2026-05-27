# Ordella Public Docs — Tone & Style

Writing standards for public documentation at docs.ordella.com.

## Principles

1. **Be direct** — Lead with what the reader can do, not company history.
2. **Be precise** — Name APIs, permissions, and objects consistently with the product.
3. **Be honest** — Mark preview, beta, or placeholder content clearly.
4. **Be inclusive** — Avoid jargon without definition; link to the [Glossary](../getting-started/glossary.md).

## Person and tense

- Use **second person** (“you”) for integrators and operators.
- Use **present tense** for product behavior.
- Use **future tense** only for roadmap items labeled as planned.

## Formatting

- Sentence case for headings.
- One idea per paragraph; max ~4 sentences in introductions.
- Use tables for comparisons; use lists for steps.
- Placeholders in docs: `<!-- Expanded content planned -->` until reviewed.

## Terminology

| Prefer | Avoid |
|--------|--------|
| tenant | account (unless customer-facing B2B) |
| location | store (when meaning Ordella location entity) |
| API key | token (unless JWT specifically) |
| Event Bus | message queue (generic) |

## Cross-linking

- Link the first mention of a related system to its docs page.
- End each page with **Related pages** when three or more links exist.
