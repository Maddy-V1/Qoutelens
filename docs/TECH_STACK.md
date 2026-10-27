# QuoteLens technical stack

The labels below distinguish the working prototype from the architecture planned for the next build. Use the four short boxes on the pitch slide; keep the status line visible in speaker notes or the demo slide.

## Four pitch boxes

| Box | Technology | What it does | Status |
| --- | --- | --- | --- |
| Buyer experience | **React + TypeScript + Vite + Motion** | Tender setup, PDF review, comparison, supplier portfolios, Lumi and drafts | **Working in this repository** |
| Document intelligence | **Gemini API** (`gemini-3.8-flash` proposed) | Read supplier PDFs and return structured quotation fields with page evidence | **Planned; not connected** |
| API + decision rules | **Node.js + TypeScript + Fastify** | Validate extraction, check hard requirements, calculate totals in integer paise, prepare drafts and maintain an audit trail | **Planned server; comparison rules currently run in the browser** |
| Accounts + data | **Supabase Auth + Postgres + Storage** | Team access, tender isolation, quotation files and supplier portfolios | **Planned; prototype uses browser storage** |

**Optional later integration:** Gmail API for buyer-approved email sending and reply status. The current app saves, copies and downloads drafts; it never claims to send them.

## The buyer journey and data flow

```text
Buyer creates a tender → supplier PDF is added → Gemini reads the PDF →
structured fields + evidence are returned → buyer verifies/corrects them →
server calculates exact totals and enforces mandatory limits →
comparison, Lumi explanation and a supplier-specific draft are shown.
```

Gemini's native PDF understanding can handle text and scanned pages, including tables and layout, so a separate OCR service is **not required for the first integration**. We may add a dedicated OCR fallback only if testing on messy quotations shows a clear accuracy gap. The model must return unknown when information is absent. It may suggest an interpretation, but it must never calculate the final money total or silently waive a mandatory requirement. The same deterministic rules that work in this prototype should move to the API and be covered by tests.

Each extracted field should carry its source page and a short supporting excerpt, plus a confidence/uncertainty flag. The buyer confirms or fixes price, tax, quantity, charges, dates, material, payment, exclusions and company identity. A changed tender brief invalidates earlier review where relevant.

Tender and quotation IDs scope every query. In production, Supabase Row Level Security and private Storage policies should enforce that buyers only access their own team’s tenders and documents. API keys stay on the server. Supplier profile claims and credentials need verification before public presentation.

## What is implemented now

- React 19, TypeScript 5.9, Vite 6, Motion and Lucide icons.
- Tender creation and separate browser-local workspaces.
- PDF selection, file validation and local IndexedDB storage; **manual** field review.
- Exact paise-based cost arithmetic and mandatory checks in `src/domain.ts`.
- Interactive comparison, priorities, supplier directory, tailored editable drafts, a rule-guided Lumi and an activity log.
- 14 domain tests. Sample companies, files, projects and remarks are clearly illustrative.

## What remains after the pitch draft

1. Build the Fastify API and move the deterministic checks server-side.
2. Add Supabase Auth, Postgres tables and private document storage with access policies.
3. Connect Gemini PDF understanding with structured output and source-page citations; test on real anonymised quotes.
4. Connect the frontend to authenticated API endpoints, preserving buyer verification and unknown states.
5. Add Gmail OAuth and buyer-approved sending only when email is connected.

Gemini is Google's hosted model/API for this proposed PDF flow. **Gemma is a separate open-model family** and is not currently used by this prototype. Avoid describing either AI integration as already live in the pitch.

Official references: [Gemini document understanding](https://ai.google.dev/gemini-api/docs/document-processing), [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output), [Gemini models](https://ai.google.dev/gemini-api/docs/models), [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
