# QuoteLens

Compare supplier quotations for **any product or service**: painting, construction, software, websites, events, supplies, consulting and more. Write or upload a tender brief, extract quotations with Gemma 4 vision, review the Markdown, and generate a comparison plus individual supplier email drafts.

## Installation and startup commands

Requirements: **Node.js 22+**, npm, a MongoDB database and an OpenRouter key with access to the configured vision model. This project was built and tested with Node.js 22.23.1.

### 1. Open the project folder

For the existing checkout on this Mac:

```sh
cd /Users/madhavvarshney/Documents/ChatGPT/hackatoberfest/quotelens-rebuild
```

For a fresh setup on another machine, use these commands instead:

```sh
git clone https://github.com/Maddy-V1/Qoutelens.git
cd Qoutelens
```

Check the installed runtime:

```sh
node --version
npm --version
```

If Node.js is missing or older than 22, install Node.js 22 or newer before continuing. MongoDB Atlas does not require a local MongoDB installation.

### 2. Install the project dependencies

Run this from the folder containing `package.json`:

```sh
npm ci
```

This installs the exact dependency versions from `package-lock.json`, including the frontend, MongoDB driver, PDF renderer and Markdown tools. No Python environment, PaddleOCR or separate OCR package is needed.

### 3. Configure the environment

Create `.env` only if it does not already exist. This command preserves an existing configured file:

```sh
[ -f .env ] || cp .env.example .env
nano .env
```

Fill in your real values locally:

```dotenv
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=quotelens
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=google/gemma-4-31b-it
API_PORT=8787
APP_ORIGIN=http://127.0.0.1:5173
NODE_ENV=development
```

In nano, press **Ctrl+O**, then **Enter** to save; press **Ctrl+X** to exit.

The current Mac checkout already has a configured `.env`; keep it. A fresh clone does not include real credentials because `.env` is ignored by Git. Never put secrets in `VITE_` variables or commit them.

For MongoDB Atlas:

1. Keep the cluster active and use a **database user**, not your Atlas account login.
2. In **Security → Network Access**, add the computer's current IP address and wait until the entry is active.
3. Copy the cluster's driver connection string into `MONGODB_URI`, replacing username/password placeholders. Percent-encode special characters in the password.
4. If connections still time out, check that the local network allows outbound TCP port 27017.

### 4. Start the full application

```sh
npm run dev
```

Keep that terminal open. This one command starts both services:

| Service | Address |
| --- | --- |
| Frontend | http://127.0.0.1:5173/ |
| Backend API | http://127.0.0.1:8787/ |
| API health | http://127.0.0.1:8787/api/health |

Open [QuoteLens](http://127.0.0.1:5173/), create an account and start a tender. Stop both services with **Ctrl+C** in the terminal where you ran `npm run dev`.

### 5. Check the connection

In a second terminal:

```sh
curl http://127.0.0.1:8787/api/health
```

Look for `"database":"connected"` and `"ai":"configured"`. The AI flag means a key is present; it is not a provider billing/access check. Signup requires the MongoDB connection to succeed. A 503 with an Atlas timeout means you should check the cluster and IP/network access above.

### Restart after editing .env

Press **Ctrl+C** in the running application's terminal, then:

```sh
npm run dev
```

Environment changes require an API restart. Refresh the browser afterward.

### Start the services separately, if needed

Use **two terminals**, both in the project folder:

```sh
# Terminal 1: backend only
npm run dev:server
```

```sh
# Terminal 2: frontend only
npm run dev:client
```

Choose either this two-terminal setup or `npm run dev`; do not run both setups at the same time. If a port is already in use, stop the earlier project's running process with Ctrl+C before starting another copy.

### Tests and production build

```sh
npm test
npm run test:server
npm run build
```

`npm run build` checks TypeScript and creates `dist/`. It does not start the application. Use `npm run dev` for the complete local frontend/API workflow. Backend tests start their own temporary MongoDB; they do not require your Atlas database.

## The complete workflow

1. **Create an account / log in.** Workspaces are private to the signed-in account. New accounts start empty.
2. **Create a tender.** Enter a project name and write the requirements in Markdown. Scope, must-haves, milestones, quantities, specifications, warranty/support, optional work and acceptable compromises belong in this one document. Location, deadline and private budget are optional.
3. **Or upload your existing brief.** On the brief form choose a PDF, PNG, JPG or WebP, then click **Start extracting**. Gemma transcribes every page into Markdown and fills the supported basic fields. Existing title/location/deadline entries are retained when present; the document replaces the brief's Markdown text. Review it before saving. The original file and original model transcription are kept.
4. **Create/save the tender.** The Markdown brief is the benchmark for comparison. You can edit it later or download it as `.md`.
5. **Add quotations.** Open Quotations, choose files and click **Start extracting**. Gemma reads the document images, transcribes all line items, options, terms, exclusions and footnotes into Markdown, and fills supplier name/email, explicit final total and currency. No T-shirt-specific fields are required.
6. **Review, then Save & preview.** Check extracted content against the original file. Correct mistakes. Missing values stay unknown. Complete this review for every quotation before comparison.
7. **Click Start comparison.** Gemma receives the full reviewed brief and all reviewed quotations. It evaluates scope, costs, currencies, deliverables, requirements, payment, deadlines, risks and missing information. It may return no recommendation when evidence is insufficient. The result is saved as Markdown.
8. **Review supplier email drafts.** After comparison, separate model requests create a draft for each supplier using only that supplier's quotation and a supplier-facing brief. The private budget field, other suppliers and comparison report are excluded from draft requests. Review, edit, save, copy or download `.eml`. No email is sent automatically.
9. **Ask Lumi.** Inside a tender, ask questions about the saved brief, quotations and comparison using the configured model.
10. **Return later.** Briefs, original files, transcriptions, reviewed documents, comparisons, drafts and activity are stored in MongoDB under your account.

Changing the brief or a reviewed quotation clears its old comparison so it can be regenerated against the new content.

## Exactly what is sent to Gemma?

Read [Exact prompts and model data flow](docs/GEMMA-PROMPTS-AND-DATA-FLOW.md). This document includes the **full verbatim system prompts**, request payload shapes, output fields, exclusions and storage behavior for:

- Brief document extraction.
- Quotation document extraction.
- Internal comparison.
- Individual supplier email drafts.
- Lumi questions.

The source of truth is [`server/prompts.mjs`](server/prompts.mjs). Regenerate the document after changing prompts:

```sh
node server/write-prompt-doc.mjs
```

PDF.js renders PDF pages into images in the browser; the images go directly to Gemma 4 through OpenRouter. **No PaddleOCR, Tesseract, separate OCR service or file-parser plugin is used.** Original files are stored in MongoDB GridFS. Exact original model text is retained separately from the buyer-edited Markdown; AI transcription still requires source review.

The private budget is supplied for internal comparison and Lumi, but omitted from supplier draft context. Known private-budget amounts and explicitly labeled private/internal-budget lines are also removed from brief text for draft requests. Review generated messages before sending. Database credentials, passwords and session cookies are never sent to the model. The OpenRouter key is used only server-side for API authorization.

## Verify the submission

```sh
npm test
npm run test:server
npm run build
```

- 14 domain tests cover the existing cost/requirement calculations.
- Backend tests use a temporary **real MongoDB instance** for account isolation, sessions, persistence, file ownership, brief/quotation extraction endpoint contracts, save conflicts, comparison reports and draft persistence. Model responses are simulated in the integration suite.
- Live brief parsing also passed on a synthetic website tender: correct 20 November 2026 deadline, Remote location and optional SMS work preserved in Markdown.
- Separate live Gemma smoke tests succeeded on a synthetic painting quotation: extracted total **INR 29,500**, preserved optional ceiling work, generated a comparison and prepared one supplier draft without the private budget. See the `docs/test-painting-*` artifacts.
- Atlas connectivity is environment-dependent. Treat it as verified only when the health endpoint reports `connected`.

## Useful files

| File | Purpose |
| --- | --- |
| `.env.example` | Environment variable template; actual `.env` stays untracked |
| `server/index.mjs` | Auth, sessions, ownership, MongoDB/GridFS and API routes |
| `server/ai.mjs` | OpenRouter adapter, input projection, extraction/comparison/drafting |
| `server/prompts.mjs` | Exact prompts sent to Gemma |
| `server/validation.mjs` | Input and model-response schemas |
| `src/vision.ts` | PDF/image preparation; no OCR |
| `src/Tenders.tsx` | Generic brief creation, PDF/image import and Markdown review |
| `src/Quotations.tsx` | Quotation extraction, source verification and save/preview |
| `src/AIComparison.tsx` | Explicit model comparison and results |
| `src/useCloudWorkspace.ts` | Account workspace loading and versioned autosave |
| `BACKEND.md` | Extra setup, endpoint and architecture details |

## Current limits

Maximum 20 MB per document, 12 pages per PDF and 10 quotations per comparison. Larger PDFs are rejected rather than truncated. Extraction/comparison can take a few minutes, depending on provider speed. Errors and incomplete responses are shown without replacing saved work. A stale workspace save is rejected to avoid overwriting another tab.

Email sending/reply sync and password-reset email delivery are not configured. Login/signup, authenticated account persistence, extraction, comparison and draft preparation use the backend. Supplier sample portfolios remain illustrative and require direct credential verification. The server binds to loopback for local development; public hosting needs HTTPS and the correct `APP_ORIGIN`.
