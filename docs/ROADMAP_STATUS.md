# NestLume — roadmap execution status

Evidence snapshot: 2026-10-01  
Source version: **1.0.0-rc.3**

Status vocabulary: `NÃO INICIADO` · `EM ANDAMENTO` · `IMPLEMENTADO` · `TESTADO` · `PUBLICADO` · `BLOQUEADO`.

| Phase | Status | Evidence / remaining gate |
|---|---|---|
| F0 Product contract & rights | EM ANDAMENTO | Current distributed corpus/datasets are pinned by source/version/hash and license inventory, and dependency-license checks run in CI. The roadmap also asks for real editorial responsibility; no human reviewer is invented, so that human assignment remains open. |
| F1 AI feasibility | TESTADO | Cloudflare Workers AI was exercised on the real authorized account through the production Worker. The Portuguese live battery, quota/error path, Turnstile boundary and zero-additional-cost deployment path are part of the release evidence. |
| F2 Premium design/prototype | IMPLEMENTADO | Premium mobile-first UI exists for Today/Explore/Reader/Paste/AI/Notebook, with light/dark/system, reduced motion and responsive layouts. Automated desktop/mobile Chromium coverage exists; real-reader validation remains an F10 human gate. |
| F3 App foundation | TESTADO | React/TypeScript/Vite PWA, strict typecheck, deterministic builds, PT/EN/ES interface foundation, no runtime secrets in the client, isolated Firebase Hosting and CI gates are implemented. |
| F4 Bible/reference engine | TESTADO | Full 66-book Bíblia Livre corpus; 1,189 chapters / 31,102 verses; reference/range validation, search, resume, chapter navigation, font size, credits and verified book-offline packaging pass CI/browser gates. |
| F5 Editorial layer | EM ANDAMENTO | Ten Scripture-grounded encounters across João and Provérbios exist with claims/sources/certainty. They remain explicitly `draft` until a named real human reviewer records review; no reviewer or seal is fabricated. |
| F6 Context/entities/originals | TESTADO | Bible-wide contextual Explore flow exposes STEPBible-derived Greek/Hebrew packages, sourced people, sourced places, connections and provenance. Exact canonical-reference/versification limits fail closed. |
| F7 Pasted text | TESTADO | Private paste preserves user text, supports optional version/reference, local identification and AI handoff only after separate explicit consent. Private text is not placed in the URL. |
| F8 Grounded AI | PUBLICADO | Live Cloudflare Workers AI is connected through a server-side Worker with strict origin, Turnstile, request/evidence validation, claim→evidence validation, prompt-injection boundary, timeout/quota handling and public rate limiting. Production deploy reruns a live Portuguese battery before Firebase publication. Unsupported evidence-heavy features, such as textual-variant analysis without a pinned source, stay unavailable rather than being invented. |
| F9 Continuity/offline | TESTADO | IndexedDB position/bookmarks/notes, export/import, deletion, PWA shell, verified Bible-book caching and original-language offline packages are implemented. Writes resolve after transaction commit and offline reload is covered in browser CI. |
| F10 Premium quality/pilot | EM ANDAMENTO | Automated desktop/mobile Chromium, accessibility-name/overflow checks, performance budget, offline smoke, contextual keyboard/history behavior and a 50-case Bible/reference security matrix exist. Real iOS/Android/desktop device testing and the proposed human-reader/reviewer pilot are inherently human gates and are not claimed by CI. |
| F11 Publication/operation | PUBLICADO | Firebase Hosting publication, default URL smoke, official custom-domain smoke, Cloudflare Worker publication and release artifacts are automated on the exact production SHA. Rollback documentation and previous releases remain available. |
| F12 Expansion | NÃO INICIADO | Post-core expansion only: additional licensed translations, richer media, optional sync/groups and other future journeys. |

## Whole-Bible execution rule

João and Provérbios are validation/editorial examples, not the product boundary. Every valid passage in the integrated 66-book corpus remains readable, searchable, notable and eligible for grounded study when sufficient evidence is available.

## AI grounding rule

A user's question is a request, not evidence. The Worker may make factual claims only from the evidence included with that request. It must not silently add original-language facts, historical context, quotations, archaeology, authorship claims or denominational labels from model memory. Claims must cite existing evidence IDs, and malformed or unsupported output fails closed.

The live battery includes explicit semantic guards for known failure modes found during editorial inspection, plus real pinned Greek and Hebrew evidence cases. The textual-variant fixture remains deliberately unavailable until a suitable pinned evidence source is added.

## Release gate

A SHA is eligible for `production` only when the full NestLume CI succeeds for that exact SHA. The production workflow then:

- re-verifies the release;
- publishes the protected Cloudflare Worker;
- runs health/auth probes and the live AI battery;
- removes the temporary CI-validation credential;
- builds the PWA with the public Worker endpoint and Turnstile site key;
- deploys only the NestLume Firebase Hosting target;
- smokes the Firebase default URL and official custom domain;
- uploads release evidence.

If the live AI battery fails, Firebase publication of that candidate is blocked.

## Publication truth

- `main` is integration/homologation.
- `production` contains only promoted, CI-passing release code.
- The official production domain is `https://nestlume.millionsnest.com`.
- Live AI uses the `nestlume-ai` Cloudflare Worker; provider secrets remain server-side.
- Bible reading, downloaded content and local notebook remain usable when AI is unavailable.

## Human-only gates

Two roadmap items cannot be manufactured by automation:

1. **Editorial publication seal:** a named real reviewer must actually review and approve the ten draft encounters before they become `published`.
2. **Human/physical-device pilot:** real readers and real iOS/Android/desktop devices must be used to claim that acceptance criterion.

These do not justify inventing completion. The technical production system remains usable while those human acceptance activities are pending.
