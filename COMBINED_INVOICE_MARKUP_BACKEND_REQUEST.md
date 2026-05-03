# Combined Invoice — Per-Line-Item Markup (Backend Request)

## Context

When users combine multiple invoices on a jobsite, the FE now opens the
combine-preview dialog with an **Add Markup** tool. Users can:

1. Click **Add Markup** to enter markup mode.
2. Tick the line items they want to mark up (or "Select all").
3. Enter a percentage (e.g. `10`).
4. Click **Apply** — the FE recomputes `unitPrice` from a captured
   `originalUnitPrice` so re-applying replaces (not compounds) the markup.

The resulting `createInvoice` call (with `combinedFromInvoiceIds` set) already
sends the marked-up `unitPrice` per line item, so totals will be correct
**without any backend change**. This document covers the **optional but
recommended** persistence/traceability work for the BE.

## API impact

### `POST /api/companies/{companyId}/invoices` (createInvoice)

The `items[]` payload now optionally includes two new fields per item:

```jsonc
{
  "sortOrder": 0,
  "service": "Subcontractor — ACME Plumbing",
  "description": "Invoice INV-1042",
  "quantity": 1,
  "unitPrice": 1100.00,         // already includes the markup
  "markupPercentage": 10,       // NEW (optional)
  "originalUnitPrice": 1000.00  // NEW (optional, == unitPrice / (1 + markup/100))
}
```

Both fields are **optional** and only present when the user applied markup to
that line. Items without markup do not include them.

### Validation rules

- `markupPercentage`: nullable, `>= 0`, `<= 1000` (sanity cap; UI doesn't enforce).
- `originalUnitPrice`: nullable, `>= 0`. If `markupPercentage > 0`, this should
  match `round(unitPrice / (1 + markupPercentage / 100), 2)` within a small
  epsilon — but treat mismatches as a warning, not a hard error (the FE is
  authoritative; users can still hand-edit `unitPrice` after applying markup).

## Persistence

Add two nullable columns to the `invoice_items` table:

| Column                  | Type           | Nullable | Notes                                |
|-------------------------|----------------|----------|--------------------------------------|
| `markup_percentage`     | `DECIMAL(7,2)` | yes      | e.g. `10.00` for 10%                 |
| `original_unit_price`   | `DECIMAL(14,2)`| yes      | unit price before the markup        |

Migration (Flyway / Liquibase):

```sql
ALTER TABLE invoice_items
  ADD COLUMN markup_percentage   DECIMAL(7,2)  NULL,
  ADD COLUMN original_unit_price DECIMAL(14,2) NULL;
```

JPA entity (`InvoiceItem`):

```java
@Column(name = "markup_percentage")
private BigDecimal markupPercentage;

@Column(name = "original_unit_price")
private BigDecimal originalUnitPrice;
```

DTOs:

- `InvoiceItemRequestDto` (create/update) — add the two optional fields.
- `InvoiceItemResponseDto` — return both fields so the FE can show the badge
  and re-edit existing combined invoices without losing context.
- `CombineInvoicesPreviewItem` — initialize `markupPercentage = 0` and
  `originalUnitPrice = unitPrice` so the FE has the baseline.

## PDF rendering (recommended)

Where the line-item table is rendered (HTML/PDF service), if
`markupPercentage > 0` show a small annotation under the description, e.g.:

> _Includes 10% markup (was $1,000.00)_

This keeps the combined invoice transparent for the end client (or for
internal audit if the markup is hidden — your call).

## Out of scope

- No changes to the combine-preview endpoint are required; the FE applies the
  markup client-side after the preview is returned.
- Tax recalculation: the FE already sends the post-markup `unitPrice`, so the
  existing server-side subtotal/tax logic continues to work unchanged.

## Summary checklist

- [ ] Add `markupPercentage` + `originalUnitPrice` to invoice item DTOs (request & response).
- [ ] DB migration for the two columns on `invoice_items`.
- [ ] Persist + return them through the create/update/get invoice endpoints.
- [ ] (Optional) Render a markup annotation on the invoice PDF.

