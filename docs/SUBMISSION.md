# QuoteLens draft submission

## Project folder

The complete working prototype is the repository root (`quotelens-rebuild/`). Use that directory for GitHub and local development. It contains the React application, sample data, comparison rules, tests, documentation, and the refined Lumi asset.

- `src/` — product screens, local storage and decision logic.
- `public/lumi-v3-refined.png` — transparent Lumi cutout for slides and later website integration.
- `docs/lumi-pitch-reference.png` — the supplied V3 presentation reference.
- `docs/landing-preview.png` and `docs/comparison-preview.png` — working desktop captures.
- `docs/TECH_STACK.md` — pitch-ready stack and current/planned status.
- `tests/domain.test.ts` — price and mandatory-rule tests.
- `README.md` — setup, walkthrough, limits and validation.

## Running it

```sh
npm ci
npm run dev
npm test
npm run build
```

The current live Site is owner-private: https://quotelens-design-studio.varshneymadhav1879.chatgpt.site/. Share GitHub and screenshots for a judge who does not have access; change Site sharing separately before using the URL as a public demo link.

All supplier examples and quotations are illustrative. The frontend works, but live OCR/Gemini, cloud accounts and email sending remain to be connected. Do not present a generated draft as sent.
