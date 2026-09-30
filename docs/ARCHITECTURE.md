# NestLume architecture — local-first core

## Principle
Reading Scripture must keep working when identity, network or AI is unavailable. Network services add capability; they are not allowed to turn the Bible into a spinner.

## Runtime
- React 19 + TypeScript + Vite static PWA.
- No Firebase SDK, Auth, Firestore or AI SDK in the browser bundle.
- Firebase is a Hosting target only at this stage.
- Public content is versioned static data; personal continuity is browser-local.
- Interface locale and Bible-edition licensing are independent concerns.

## Bible content pipeline
Raw source files live under `public/corpus/blivre/2018.2.0/tr` and are never rewritten as the canonical source.

`scripts/build-corpus.mjs`:
1. reads the pinned manifest;
2. recomputes the Git blob hash from every raw file;
3. fails on any mismatch or missing file;
4. parses book metadata and verse records;
5. asserts 66 books, 1,189 chapters and 31,102 verse records for this exact corpus;
6. generates `catalog.json` and a normalized local `search-index.json` during development/build.

The application loads books on demand. Full-text search loads the local index only when used. Search normalization is for matching; displayed Scripture comes from the parsed raw book file.

## Routes
- `/` Today / continuity
- `/explorar` reference and local word search
- `/ler/:ubsCode/:chapter?v=start-end` reader and verse-range deep link
- `/colar` private pasted-text identification
- `/caderno` local notebook, backup and restore
- `/estados` honest unavailable/error examples

## Reference behavior
Reference syntax is parsed separately from book resolution. Book names/codes must resolve against the imported catalog and the chapter/verse bounds are checked against the actual edition. Invalid references fail closed; no silent correction is made.

## Offline behavior
The shell has its own cache. Bible books are **explicit downloads**: the service worker fetches the selected raw book, recomputes its Git object hash in-browser and only then stores it in the Bible cache. A failed integrity check is reported as failure. The search index is not silently treated as an offline Bible package.

## Private continuity
`src/lib/notebook.ts` owns IndexedDB schema v1 for:
- exact reading position;
- bookmarks;
- notes/questions/highlights data shape;
- JSON export;
- version validation;
- explicit merge vs replace import;
- explicit local-data deletion.

Pasted text and notebook records are not sent to telemetry, Firebase or an AI provider by this core.

## Editorial layering
Bible text is visually separated from commentary. The initial João 1:1–18 layer is labeled as a **draft** because no human reviewer has been registered. Context panels separately label person, original-language note, Bible thread and source provenance. The original-language panel keeps an explicit limitation until a licensed, pinned lexical/alignment dataset is added.

## Internationalization
PT/EN/ES message dictionaries cover navigation and the core reader/search/notebook controls. Editorial content is independently versioned content and must not be presented as translated merely because interface locale changes.

## AI boundary
Live generation is fail-closed. No secret-bearing provider request exists in client code. Static content is never relabeled as AI.

## Hosting boundary
`firebase.json` points to `dist` with SPA rewrites and immutable hashed assets. There is intentionally no `.firebaserc` binding until an isolated Spark project/site is actually inspected/provisioned, preventing accidental deployment to another MillionsNest Firebase project.

## Security
No frontend role check is authority. Hub integration, if later approved, must reuse canonical MillionsNest contracts. Private notes remain outside organization scope unless a later explicit synchronization design says otherwise.


## Provider-neutral AI contract
The PWA uses `src/lib/ai.ts` and never receives provider credentials. Every outbound generation request is prepared with a versioned consent record, an explicit evidence bundle and hard size limits. The application does not silently truncate user text.

A public `VITE_NESTLUME_AI_ENDPOINT` may point to an approved server-side adapter after F1 passes. This URL is not a secret. Provider credentials and bindings remain server-side.

The first candidate adapter lives under `workers/ai/`. It is source-only until F1 approval and real Cloudflare deployment evidence exist. It uses a Workers AI binding, configures no prompt storage, restricts production CORS to the NestLume origin, requires evidence, treats pasted/evidence content as untrusted data and fails closed on quota/provider errors.

The product contract is provider-neutral:
- Cloudflare Workers AI is the zero-additional-cost F1 candidate.
- A future OpenAI API adapter may replace or complement it without redesigning the product. OpenAI's current under-18 API guidance permits apps serving minors when additional safeguards and applicable child/privacy requirements are implemented; personal data below the applicable digital-consent age requires Zero Data Retention first.
- Current Google Cloud Generative AI terms prohibit use in applications directed to or likely accessed by under-18s. Paid Gemini/Vertex therefore is not currently a teen-accessible migration path; re-evaluate if Google's terms change.
- A ChatGPT consumer subscription is never treated as API credit.


## Whole-Bible coverage model
NestLume's base capability is canonical-reference driven, not study-file driven. The complete integrated Bible remains the primary corpus. A generic editorial registry maps optional human-reviewed encounters onto passages without making those encounters a prerequisite for study.

João/Provérbios are initial validation fixtures only. The same reader, grounded-AI contract, evidence model, source provenance, entity model and lexical registry must work across all 66 books.

For a passage with no published editorial encounter, the reader still exposes Bible-wide study actions. Advanced layers fail closed individually: for example, the absence of a validated Hebrew alignment disables a precise Hebrew word panel for that occurrence but does not disable reading, notes, search or a Scripture-grounded question.
