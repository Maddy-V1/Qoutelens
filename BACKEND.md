# QuoteLens backend setup

## Configure and start

Edit `.env` in this folder. It is ignored by Git. Supply only:

```dotenv
MONGODB_URI=mongodb+srv://DATABASE_USER:DATABASE_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
```

The URI must use a MongoDB **database user** (not your Atlas login). Percent-encode special characters in the password. In Atlas, allow your computer's IP in Network Access. `MONGODB_DB=quotelens` and `OPENROUTER_MODEL=google/gemma-4-31b-it` are already set. A local MongoDB URI such as `mongodb://127.0.0.1:27017` works too if a local server is running.

From this folder run:

```sh
npm install
npm run dev
```

This starts the Vite frontend on http://127.0.0.1:5173 and the Node API on http://127.0.0.1:8787. After changing `.env`, restart the API (`Ctrl+C`, then rerun the command). If the frontend is already running, run `npm run dev:server` separately instead of starting a second frontend.

Check http://127.0.0.1:8787/api/health — it reports `database: connected` and `ai: configured` when configured. The AI flag checks key presence, not provider billing/access. Never put secrets in VITE_ variables, commit `.env`, or paste keys into the browser.

## Submission walkthrough

1. Create an account. A new account starts empty; no old browser sample data is imported.
2. Create a tender for **any product or service**. Write a Markdown brief, or choose an existing brief PDF/image and click **Start extracting**. Review the full transcription, then save. Original brief files and model transcriptions are retained. Location, deadline and private budget are optional; currency is configurable.
3. Add quotation PDFs or PNG/JPG/WebP images (20 MB each, at most 12 PDF pages).
4. Click **Start extracting**. PDF.js renders every PDF page into an image; the configured Gemma vision model reads the images. There is **no PaddleOCR, Tesseract or external OCR parser**. The original file is stored in MongoDB GridFS, and exact model-returned transcription is retained as `sourceMarkdown`. Editable reviewed content is stored in `markdown`.
5. Check the source alongside the extracted Markdown. Only supplier name/email, explicit final total and currency need separate fields. All scope, category-specific specifications, optional items, exclusions and terms remain in Markdown. Unknowns stay unknown.
6. Click **Save & preview**. Review all quotations before comparison.
7. Open **Comparison → Start comparison**. The same model evaluates the full brief and all quotation Markdown, returning an evidence-based report. Separate requests prepare each supplier's draft using only that supplier's quotation and a brief stripped of private financial fields. Reports and drafts are saved atomically to the account.
8. Open **Messages** to edit, save, copy or download supplier email drafts. Nothing is sent automatically. Lumi can answer questions about a saved tender using the same configured model.
9. Reload or log out and back in to verify MongoDB persistence.

## Architecture and endpoints

- Node 22 HTTP API, official MongoDB driver, Zod input/model-response validation.
- Passwords use salted scrypt hashes. Sessions use random tokens, hashed in MongoDB, in HttpOnly SameSite cookies. Production cookies are Secure. Mutations check Origin.
- Every workspace/file/model request is scoped to the signed-in account. Originals live in GridFS. Workspace updates use a version to reject overwrites from stale tabs. API keys never enter the frontend.
- `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `/api/workspace` GET/PUT
- `/api/files/:tenderId%2F:offerId` POST/GET
- `/api/briefs/extract` POST
- `/api/tenders/:id/extract`, `/compare`, `/chat` POST
- `/api/health` GET

Prompts are in `server/prompts.mjs`; OpenRouter adapter is in `server/ai.mjs`; routes are in `server/index.mjs`. Model responses are schema-validated; provider failures, rate limits, truncation, invalid JSON and save conflicts produce explicit retryable errors. Document content is treated as untrusted evidence.

## Validation and limits

```sh
npm test
npm run test:server
npm run build
```

Backend tests start a temporary real MongoDB instance and exercise signup/login, persistence, tenant isolation, file access, save conflicts, extraction endpoint contracts and comparison/draft persistence. AI output is simulated in integration tests. A separate live smoke test using the configured Gemma 4 key successfully extracted a synthetic painting quotation, including the correct INR 29,500 total and optional ceiling work. Fixtures and the exact returned transcription are in `docs/test-painting-*`. Broader extraction accuracy still requires review with your actual documents. The test runner uses an existing `/opt/homebrew/bin/mongod` when available; otherwise mongodb-memory-server downloads a temporary MongoDB binary.

Limits: 10 quotations per comparison, 12 pages per document, 20 MB per file. No email sending/reply sync or password-reset email service is configured; the reset endpoint explicitly reports this. The server currently binds to loopback for local submission. Hosting needs an HTTPS reverse proxy and an appropriate APP_ORIGIN. Model transcription can contain errors; the review step is required, and exact transcription cannot be guaranteed for illegible scans. MongoDB is not considered connected until `/api/health` confirms it.

## Exact prompts and data flow

Read [the complete generated prompt document](docs/GEMMA-PROMPTS-AND-DATA-FLOW.md) for every system prompt and the exact data projection used for brief extraction, quotation extraction, comparison, email drafting and Lumi.
