import {writeFile} from 'node:fs/promises';
import {BRIEF_EXTRACTION_PROMPT,EXTRACTION_PROMPT,COMPARISON_PROMPT,DRAFT_PROMPT,CHAT_PROMPT} from './prompts.mjs';
let doc=`# QuoteLens: exact Gemma prompts and data flow

Generated directly from server/prompts.mjs. Regenerate with \`node server/write-prompt-doc.mjs\` after changing a prompt.

## Model and request configuration

- Endpoint: https://openrouter.ai/api/v1/chat/completions
- Model: the server-side OPENROUTER_MODEL setting; default google/gemma-4-31b-it.
- Temperature: 0.1. Output limit: 12,000 tokens. Response format: json_object.
- A system message contains the exact prompt below. A user message contains the data listed for that operation. There are no other developer prompts or hidden application instructions.
- The API key is used only in the Authorization header sent to OpenRouter. It is never placed in a prompt or browser bundle. MongoDB credentials, session cookies, password hashes and account passwords are never sent to Gemma.
- Your documents and comparison text ARE transmitted to OpenRouter and its selected model provider. Raw files are stored in your MongoDB account; the browser renders PDF pages into images for vision. No PaddleOCR, Tesseract, separate OCR service or file-parser plugin is used.

## 1. Upload a brief PDF/image and extract it

**When:** Create/edit tender → Choose document → Start extracting.

**User-message contents:** a short text instruction, followed by one base64 JPEG image per rendered PDF page (or one normalized image for an uploaded image). Every page is included, in order. PDFs over 12 pages are rejected rather than silently truncated. The raw PDF bytes are NOT included in the model request.

Text instruction: \`Transcribe this full tender brief from all N supplied page images. Preserve its exact content in Markdown.\`

**Response:** title, complete Markdown, explicit calendar deadline, location, currency, missingFields and warnings. The Markdown fills the editable brief. Existing manually entered title/location/deadline are retained when present. The original file, original model transcription, filename and reviewed Markdown are stored with the brief after saving. The numeric private budget is entered separately by the buyer.

**Exact system prompt:**

`;
const fence=s=>'```text\n'+s+'\n```\n\n';
doc+=fence(BRIEF_EXTRACTION_PROMPT);
doc+=`## 2. Upload a quotation PDF/image and extract it

**When:** Quotations → Choose files → Start extracting.

**User-message contents:** \`Extract this quotation from all N supplied page images. Preserve source wording in Markdown.\`, followed by page-image content parts exactly as for brief extraction. No buyer brief or private budget is supplied for extraction.

**Response:** complete Markdown; supplier name, email, contact, business type; explicit final total; currency; explicit delivery calendar date; short scope; warnings; missingFields. Missing information stays blank/null. Only supplier name/email, final total and currency have separate review fields; all category-specific details and optional fields remain in Markdown.

**Storage:** Original document in GridFS; exact original model transcription in sourceMarkdown; editable reviewed content in markdown. Model ID and extraction time are recorded. Save & preview marks the quotation as reviewed. Do not equate AI transcription with guaranteed exact source text: the buyer must compare it against the original.

**Exact system prompt:**

`+fence(EXTRACTION_PROMPT);
doc+=`## 3. Start comparison

**When:** Comparison → Start comparison. Every quotation must be reviewed first. Maximum 10 quotations.

**User-message JSON:**

\`\`\`json
{
  "brief": {
    "title": "Project title",
    "markdown": "Full current buyer-reviewed brief",
    "location": "Stated location or empty string",
    "deadline": "Stated date or empty string",
    "currency": "Brief currency",
    "privateBudget": "Numeric private maximum or null",
    "requirements": "Legacy explicit requirements, if present",
    "acceptableCompromises": "Legacy explicit compromises, if present",
    "payment": "Legacy explicit payment requirements, if present",
    "sharedPriceRange": "Included only when the buyer explicitly chose to share it"
  },
  "quotations": [
    {
      "offerId": "Exact internal quotation ID",
      "supplier": "Supplier name",
      "currency": "Stated currency",
      "explicitTotal": "Numeric final total or null",
      "quotationMarkdown": "Full current reviewed supplier quotation"
    }
  ]
}
\`\`\`

The private budget DOES go to Gemma for this internal analysis. Raw PDFs, base64 images, MongoDB file IDs, authentication credentials and raw extraction duplicates do NOT go to this comparison request. The data projection is implemented by analysisBrief() in server/ai.mjs.

**Response:** summary, complete evidence-based Markdown report, exactly one assessment per supplied offer ID, and a recommended offer ID or null. The server rejects invented/missing/duplicate offer IDs. Different currencies are not assumed equivalent. The report includes scope, cost, terms, strengths, risks, unknowns, requirements and next actions, not private chain-of-thought.

**Exact system prompt:**

`+fence(COMPARISON_PROMPT);
doc+=`## 4. Generate each supplier's email draft

This is a SEPARATE model request for each supplier, after comparison. It is not generated in the all-suppliers comparison call. Only two draft requests run concurrently.

**User-message JSON:**

\`\`\`json
{
  "brief": {
    "title": "Supplier-safe project title",
    "scope": "Full supplier-facing brief Markdown",
    "deadline": "Deadline or Not specified",
    "location": "Location or Not specified",
    "requirements": "Explicit requirements if present",
    "acceptableCompromises": "Explicit compromises if present",
    "payment": "Explicit payment terms if present",
    "sharedPriceRange": "Only if explicitly disclosed"
  },
  "supplier": "This supplier's name",
  "quotationMarkdown": "ONLY this supplier's reviewed quotation"
}
\`\`\`

**Excluded:** privateBudget field, review instructions, other suppliers' documents/prices, comparison report, login details, account email, files and images. Known private-budget amounts and lines explicitly labeled private/internal budget are also removed from buyer brief text before the draft request. This is a precaution, not a guarantee against inferring information; review every generated draft before sending.

**Response:** subject and plain-text body. The recipient comes from the reviewed supplier email, not from an invented model address. Drafts and comparison are saved together with a version check; concurrent changes reject the result instead of overwriting newer work. Existing externally sent message records block regeneration to avoid losing conversation history. No email is sent automatically.

**Exact system prompt:**

`+fence(DRAFT_PROMPT);
doc+=`## 5. Ask Lumi

**User-message JSON:** the question, the internal analysisBrief() projection (including private budget), the saved supplier Markdown documents/basic totals, and the saved comparison Markdown if one exists. No page images, original file bytes, account/session credentials or password hashes are supplied. Lumi is an internal assistant, not a supplier-facing channel.

**Response:** a concise factual answer, shown in the assistant panel.

**Exact system prompt:**

`+fence(CHAT_PROMPT);
doc+=`## Source map and verification

- server/prompts.mjs: every exact system prompt above.
- server/ai.mjs: payload construction, supplier-safe projection, response validation, OpenRouter call.
- server/validation.mjs: extraction and comparison response schemas.
- server/index.mjs: authentication, ownership checks, storage and endpoints.
- src/vision.ts: PDF-to-image rendering in the browser, with no OCR.
- src/Tenders.tsx: brief document upload and reviewed Markdown.
- src/Quotations.tsx: quotation extraction and review.
- src/AIComparison.tsx: explicit Start comparison action.

Live smoke tests succeeded for a synthetic painting quotation: vision extraction returned INR 29,500 and optional ceiling work; comparison produced a report and one supplier draft, with the private budget absent from that draft. Full account/data/file integration tests run against a temporary real MongoDB instance. Real Atlas connectivity depends on the configured URI, active cluster, network access list and local network.
`;
await writeFile(new URL('../docs/GEMMA-PROMPTS-AND-DATA-FLOW.md',import.meta.url),doc);
console.log('Generated docs/GEMMA-PROMPTS-AND-DATA-FLOW.md');
