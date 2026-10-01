# NestLume — roadmap execution status

Evidence snapshot: 2026-09-30  
Source version: **1.0.0-rc.1**

Status vocabulary: `NÃO INICIADO` · `EM ANDAMENTO` · `IMPLEMENTADO` · `TESTADO` · `PUBLICADO` · `BLOQUEADO`.

| Phase | Status | Evidence / remaining gate |
|---|---|---|
| F0 Product contract & rights | TESTADO | Current distributed corpus/datasets are pinned by source/version/hash and license inventory. Dependency license allowlist runs in CI. New future datasets still require the same gate before inclusion. |
| F1 AI feasibility | BLOQUEADO | Cloudflare Workers AI passes the current documentary cost/privacy/model-license architecture gate and the server adapter + 20-case harness exist. Real authorized Cloudflare account/binding, actual Portuguese inference battery, quota behavior and human review remain external gates. |
| F2 Premium design/prototype | IMPLEMENTADO | Premium editorial mobile-first UI, Today/Explore/Reader/Paste/AI/Notebook, light/dark/system, reduced motion and responsive layouts exist. Automated desktop/mobile Chromium coverage exists; real-device and human-reader validation remain F10 gates. |
| F3 App foundation | TESTADO | React/TypeScript/Vite PWA, strict typecheck, deterministic builds, PT/EN/ES interface foundation, no runtime secrets, Firebase Hosting config without accidental project binding and CI gates are implemented. |
| F4 Bible/reference engine | TESTADO | Full 66-book Bíblia Livre corpus; 1,189 chapters / 31,102 verses; reference/range validation, reading, search, resume, chapter navigation, font size, credits and verified book-offline packaging passed the full CI/browser gate on the release-candidate code. |
| F5 Editorial layer & whole-Bible study | EM ANDAMENTO | Whole-Bible study capability is independent of hand-authored studies. The initial library now has 10 Scripture-grounded encounters across João and Provérbios with claims/sources/certainty. All remain explicitly `draft` until a named real reviewer records human review; no content is falsely labeled reviewed. |
| F6 Context/entities/originals | TESTADO | Generic contextual Explore flow exposes local passage context, STEPBible-derived Greek/Hebrew/Aramaic packages, sourced people, sourced places, Bible-wide connections and provenance. Source integrity, representative Greek/Hebrew coverage, versification mismatch behavior and desktop/mobile contextual navigation passed CI/browser gates. |
| F7 Pasted text | TESTADO | Private paste preserves user text, supports optional version/reference, local corpus identification and handoff to AI only in session memory. Browser tests verify private text is not placed in the URL and third-party processing requires separate explicit consent. |
| F8 Grounded AI | BLOQUEADO | Provider-neutral request/evidence contract, claim→evidence validation, prompt-injection boundary, timeout/quota states, Turnstile-before-inference protection and Cloudflare Worker source are implemented. Live generation is disabled until F1 real-account tests pass. |
| F9 Continuity/offline | TESTADO | IndexedDB position/bookmarks/notes, export/import, deletion, PWA shell, verified Bible-book caching and original-language offline packages are implemented. Writes resolve only after IndexedDB transaction commit, preventing navigation races. Desktop browser CI reloads downloaded Scripture and original-language data with the network disabled. |
| F10 Premium quality/pilot | EM ANDAMENTO | CI includes desktop/mobile Chromium, whole-Bible representative genre matrix, accessible-name/overflow checks, performance budget, offline smoke and contextual-panel focus/Escape/Back behavior. Real iOS/Android/desktop device testing and human pilot cannot be truthfully claimed from CI. |
| F11 Publication/operation | EM ANDAMENTO | The isolated Firebase Hosting target `nestlume-555464791734` has been deployed successfully through existing WIF and its default `web.app` URL passed public smoke. The Firebase custom-domain resource exists, but `nestlume.millionsnest.com` remains pending because authoritative DNS has not received the Firebase-requested record. |
| F12 Expansion | NÃO INICIADO | Post-core expansion only: additional licensed translations, richer media, optional cloud sync/groups and further editorial journeys after current gates are validated. |

## Whole-Bible execution rule

João and Provérbios in planning materials are validation examples, **not** the product boundary. Every valid passage in the integrated 66-book corpus remains readable/searchable/notable and can enter the grounded study flow. Editorial studies, entity detail and lexical precision are additional layers whose availability depends on verified evidence for the exact passage.

## Release gate

A SHA is eligible for `production` only when the full NestLume CI succeeds for that exact SHA. The gate covers:

- TypeScript checks;
- corpus and generated-data integrity;
- notebook/editorial/reference/AI security tests;
- dependency-license allowlist;
- deterministic production build;
- desktop and mobile Chromium smoke;
- representative whole-Bible genre coverage;
- verified offline reload;
- performance budget;
- contextual-panel keyboard/history behavior;
- AI Worker + F1 battery syntax;
- secret-like file rejection.

The GitHub Actions run associated with the promoted SHA is the release evidence; this file deliberately avoids a hard-coded run number that becomes stale after documentation-only commits.

## External blockers that code cannot fabricate

### Live AI
No Cloudflare account/binding/token is exposed to this session. Therefore the real 20-case F1 model battery cannot be executed yet. The UI remains fail-closed and does not substitute static content for AI.

### Firebase + domain
Firebase publication is automated and has already succeeded through the repository's existing Workload Identity Federation path. The remaining external gate is authoritative DNS for `millionsnest.com`: the Firebase resource currently requests the NestLume subdomain record, while the deployment evidence reports no available DNS credential. Until that record exists and Firebase finishes certificate validation, only the default Firebase URL is claimed live.

Target domain remains `nestlume.millionsnest.com`.

## Publication truth

- `main` is the integration/homologation line.
- `production` is synchronized only to a full-CI-passing approved SHA by fast-forward.
- Branch equality proves **code synchronization**, not hosting publication.
- F11 becomes fully `PUBLICADO` only after Firebase deployment, DNS, HTTPS and public smoke are evidenced for the same release SHA. A Firebase-default-URL publication may be live while the custom-domain gate is still pending.

## Human gates

Some requirements cannot be manufactured by automation:
- human doctrinal/editorial review must identify the actual reviewer;
- a human-reader pilot must involve real readers;
- real-device testing must use real devices, not browser emulation.

Until those happen, the app reports the relevant layer honestly instead of inventing approval.


## Latest full automated gate
RC2 must pass the full NestLume CI gate on its exact final SHA before branch promotion. The most recent prior functional SHA completed the gate successfully; no test status is inferred from branch naming, previous runs or documentation alone.
