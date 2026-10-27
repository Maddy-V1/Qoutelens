# QuoteLens

A complete browser-local procurement experience, rebuilt with React, TypeScript, Vite, Motion and Lucide.


## Pitch and submission

- [Technology boxes and honest implementation status](docs/TECH_STACK.md)
- [Project handoff and folder map](docs/SUBMISSION.md)
- [Refined Lumi cutout](public/lumi-v3-refined.png) for the presentation (transparent PNG)
- [Working comparison preview](docs/comparison-preview.png)

## Run

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The active source lives in `quotelens-rebuild/`. The earlier implementation remains in the sibling `quotelens-studio/` directory. The existing Sites project identity and owner-only access are preserved.

## Walkthrough

Landing → My Tenders → “College fest merchandise” → The brief → Quotations → Review → Comparison → Lumi → Drafts → Studio Merch portfolio → Invite to a tender.

The sample is 100 cotton team T-shirts for TechSpace Fest, delivered to Dwarka by 10 November 2026. All sample businesses, documents and projects are illustrative.

| Supplier | Base | Included charges | Tax | Evaluated total | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| QuickPrint | ₹24,000 | ₹3,500 | ₹1,375 | ₹28,875 | Fails fabric, delivery, advance and overall mandatory confirmation |
| Campus Supply | ₹28,000 | Unknown delivery | ₹1,400 on known amount | ₹29,400 + unknowns | Delivery date/cost and review incomplete |
| Print & Co. | ₹27,000 | ₹2,100 | ₹1,455 | ₹30,555 | Viable; bulk packing explicitly allowed |
| Studio Merch | ₹30,000 | ₹0 | ₹1,500 | ₹31,500 | Overall fit recommendation |
| Threadworks | ₹32,000 | ₹0 | ₹1,600 | ₹33,600 | Earliest delivery and lowest upfront payment |

Print & Co.’s included charges are setup ₹800, delivery ₹700, and a required printed sample ₹600. Excluding a required option blocks eligibility. All tax in this sample is 5% of base plus included charges. Actual tax applicability must be verified against the supplier document.

## Working functionality

- Independent tenders, editable briefs, explicit private budget versus disclosed range.
- Short two-step creation, optional specifications, payment, compromises and reference filename list.
- PDF selection/drop, signature/type/25 MB validation, local IndexedDB storage, original-PDF viewing.
- Manual review of supplier identity, quantities, prices, tax, options, specifications, dates, advances and exclusions. Blank means unknown, never zero.
- Deterministic paise-based arithmetic and mandatory checks. Changed briefs invalidate offer review. Changed offers recalculate the comparison.
- Interactive cost/advance chart, selected-offer evidence, written requirements and delivery dates; priorities reorder viable offers without relaxing hard limits.
- Per-tender shortlist, saved drafts, .eml download, copy, explicit buyer-recorded external-send/reply status.
- Dedicated supplier search, capability/category/location filters, saved suppliers, rich sample portfolios, editable local portfolio drafts and tender invitation drafts.
- Lumi transforms from a compact animated character to a contextual assistant panel. Responses are rule-based, scoped to the active tender, and explicitly labeled as a guided demo.
- Separate readable activity and evidence log, accessible native dialogs, keyboard focus styles, reduced-motion support, and mobile compositions.
- Unsaved edit protection for quotation reviews and correspondence; recoverable application error screen.

## What remains to connect

No live OCR or model API runs. Uploaded PDFs open with blank fields for manual verification. Sample evidence records are illustrative, not claims of extraction. There is no cloud persistence, authentication/team access, public supplier signup/identity verification, Gmail sending or reply sync. Reference attachments on the brief store filenames only. PDF contents stay in this browser via IndexedDB. Tender data, drafts and local profiles use localStorage. Clearing site data removes those local records.

Generated supplier messages exclude the private budget and competitor prices. They never accept an offer. Email is never presented as sent by QuoteLens. A waiting status requires the buyer to attest they sent it externally.

Free-text requirements cannot be semantically verified by this demo. Explicit buyer confirmation is required; exact structured specifications are compared conservatively. No ranking confidence percentages are fabricated.

## Validation

`npm test`: 14 tests cover all five totals, tax/advance arithmetic, paise rounding, hard limits, incomplete costs, required options, private budget, priorities, draft confidentiality and tender isolation.

`npm run build`: TypeScript checks and production bundling pass.

Browser QA: desktop layout at approximately 1309 CSS pixels and phone layout at 390 CSS pixels; landing, tender list/brief/creation, quotation review, comparison, Lumi, drafts and supplier portfolio. Tested priority changes, draft edit/save/reload, supplier invitation privacy, separate tender creation, manual quotation calculation (₹35,990), and long supplier-name wrapping without horizontal page overflow. The native date control was exercised through accessibility input. Screenshots are local in ignored `qa/`. After restoring the older visual direction, checked landing, My Tenders, comparison, Lumi, drafts and portfolio again; corrected inherited mobile landing and navigation overflow. Native file-picker automation was unavailable, so PDF upload was not verified end-to-end in the browser.

## Design references

The final direction restores the preferred earlier QuoteLens design: lavender, white surfaces, a familiar sidebar workflow, compact selectable comparison bars, and the original long-eared Lumi companion. The React data model, editable reviews, hard-limit calculations and richer supplier portfolios are retained from the rebuild. [Magic UI](https://magicui.design/) and [21st.dev](https://21st.dev/) informed restrained progressive reveals and component interaction patterns. [Motion’s shared layout documentation](https://motion.dev/docs/react-layout-animations) informed Lumi and navigation transitions. No whole template was copied. SVG portfolio artwork is original illustrative code.
