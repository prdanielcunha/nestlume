# NestLume — roadmap execution status

Evidence snapshot: 2026-09-30

Status vocabulary: `NÃO INICIADO` · `EM ANDAMENTO` · `IMPLEMENTADO` · `TESTADO` · `PUBLICADO` · `BLOQUEADO`.

| Phase | Status | Evidence / next gate |
|---|---|---|
| F0 Product contract & rights | EM ANDAMENTO | Exact BLIVRE release 2018.2.0/TR pinned; 66 raw files + per-file Git object hashes + upstream license/README preserved; integrity/count gate passes. Future lexical/media inventory and a real human reviewer are still pending. |
| F1 AI feasibility | EM ANDAMENTO | Cloudflare Workers AI passes the current documentary cost/privacy/license architecture gate and is the implementation candidate. Provider-neutral request/consent contracts, tests and a source-only Worker adapter exist. Real Cloudflare account inference + the 20-case Portuguese battery remain mandatory before TESTADO. |
| F2 Premium design/prototype | IMPLEMENTADO | Responsive premium editorial experience includes Today, full reader, contextual panels, Explore, paste, notebook, light/dark/system and reduced-motion handling. Real-device/user validation still required before TESTADO. |
| F3 App foundation | TESTADO | React/TS/Vite, strict checks, PWA shell, no runtime secrets, Firebase Hosting config without project binding. GitHub Actions continuously runs install, typecheck/tests/corpus gate/build. |
| F4 Bible/reference engine | IMPLEMENTADO | Full 66-book BLIVRE corpus imported; build verifies 1,189 chapters / 31,102 verses and exact source hashes; dynamic chapter reader, ranges, font size, resume, catalog-bound reference validation, word search, credits and explicit verified offline-book packages are wired. Browser/device smoke remains before TESTADO. |
| F5 Editorial layer & whole-Bible coverage | EM ANDAMENTO | The product scope is Bible-wide. João 1 is only the first registered editorial fixture, not a scope boundary. A generic passage registry now separates optional human-reviewed editorial coverage from the core ability to study any valid Bible passage. Named human review and broader canon coverage remain required before the editorial layer is considered mature. |
| F6 Threads/entities/originals | EM ANDAMENTO | Architecture is Bible-wide; João 1 is the first verified lexical/entity fixture only. STEPBible is pinned at commit `b99716b0cddb648ddb95cc786a197180f2f97d48`; TBESG/TBESH/TAGNT/TAHOT provenance is recorded and verified João 1 Greek bundles prove the pipeline. Expansion across Greek NT plus Hebrew/Aramaic OT requires deterministic alignment validation before each bundle is shown. |
| F7 Paste text | IMPLEMENTADO | Text stays local, version/ref optional, local corpus candidate identification, reference confirmation and honest unknown state. No third-party transmission. Broader browser test matrix remains. |
| F8 Grounded AI | EM ANDAMENTO | Consent/evidence request contract, fail-closed limits and Cloudflare Worker adapter source are implemented. Live generation remains disabled until real F1 inference tests, quota behavior and production rate limiting pass. No static fallback is represented as AI. |
| F9 Continuity/offline | IMPLEMENTADO | IndexedDB position/bookmarks/notes, JSON export, validated import with explicit merge/replace, local deletion and verified explicit book caching are implemented. Interrupted-cache and browser migration/restore tests remain before TESTADO. |
| F10 Premium quality/pilot | NÃO INICIADO | CI is green, but real mobile/desktop devices, accessibility tooling, a whole-Bible representative test matrix across canonical genres, performance measurements and human pilot remain required. |
| F11 Publication/operation | BLOQUEADO | Source has Firebase Hosting config, but this session still lacks authenticated Firebase project-management and authoritative DNS write access. No project/domain/HTTPS is claimed. |
| F12 Expansion | NÃO INICIADO | Post-core only. |

## Automated evidence
The AI/editorial integration through commit `fad8c2edf5cf0afb14a11dd64a77899784c31641` passed NestLume CI run **36707060508**. The earlier full-reader commit `b9c9f99e26414dd2862c6fa16c9219ff8908951d` passed run **36698477742**. CI executes TypeScript checks, tests, full corpus integrity/count verification, production build, AI Worker syntax validation and secret-like file rejection.

## Known validation limitation
A separate local browser smoke could not be run from the current container because its network cannot resolve GitHub to clone the repository. This is **not** counted as a browser pass. GitHub Actions is real CI evidence; real browser/device evidence remains an explicit F10 gate.

## Publication truth
- No Firebase project/site has been created or changed by this execution.
- No DNS record has been created or changed.
- No `production` release is claimed.
- `nestlume.millionsnest.com` is not claimed operational until deployment, DNS, certificate and public smoke tests are evidenced.


## AI provider migration
Cloudflare Workers AI is the current R$0 candidate. The product-facing contract is provider-neutral so a future OpenAI API adapter can be introduced without redesigning the study experience. Current Google Cloud Generative AI age restrictions still block a teen-accessible NestLume use case even on paid Google Cloud; re-evaluate only if Google's terms change. Consumer ChatGPT subscriptions are never treated as API credits.


## Whole-Bible scope clarification
João and Provérbios in the planning documents are validation examples/pilot material, not the intended product boundary. The authoritative execution rule is documented in `WHOLE_BIBLE_SCOPE.md`: every valid passage in the integrated 66-book corpus must remain readable and studyable through the core engine, while human-reviewed editorial encounters, lexical precision, entities and other advanced layers expand only where their evidence has actually been validated.
