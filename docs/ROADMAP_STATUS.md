# NestLume — roadmap execution status

Evidence snapshot: 2026-09-30

Status vocabulary: `NÃO INICIADO` · `EM ANDAMENTO` · `IMPLEMENTADO` · `TESTADO` · `PUBLICADO` · `BLOQUEADO`.

| Phase | Status | Evidence / next gate |
|---|---|---|
| F0 Product contract & rights | EM ANDAMENTO | Exact BLIVRE release 2018.2.0/TR pinned; 66 raw files + per-file Git object hashes + upstream license/README preserved; integrity/count gate passes. Future lexical/media inventory and a real human reviewer are still pending. |
| F1 AI feasibility | BLOQUEADO | Current provider research preserved in `F1_AI_FEASIBILITY.md`. Gemini unpaid is incompatible with the intended under-18-accessible/private-paste use; other candidates do not yet have the required real 20-case/account/terms proof. Live AI remains disabled. |
| F2 Premium design/prototype | IMPLEMENTADO | Responsive premium editorial experience includes Today, full reader, contextual panels, Explore, paste, notebook, light/dark/system and reduced-motion handling. Real-device/user validation still required before TESTADO. |
| F3 App foundation | TESTADO | React/TS/Vite, strict checks, PWA shell, no runtime secrets, Firebase Hosting config without project binding. GitHub Actions continuously runs install, typecheck/tests/corpus gate/build. |
| F4 Bible/reference engine | IMPLEMENTADO | Full 66-book BLIVRE corpus imported; build verifies 1,189 chapters / 31,102 verses and exact source hashes; dynamic chapter reader, ranges, font size, resume, catalog-bound reference validation, word search, credits and explicit verified offline-book packages are wired. Browser/device smoke remains before TESTADO. |
| F5 Initial editorial library | EM ANDAMENTO | João 1:1–18 draft is rendered and explicitly labeled unreviewed. 8–12 reviewed João/Provérbios encounters and named human review are still required. |
| F6 Threads/entities/originals | EM ANDAMENTO | João 1 entity/thread/original-language UX exists with explicit limitation. STEPBible CC BY data was investigated but is not bundled until exact datasets/commit/hash/transforms are pinned. |
| F7 Paste text | IMPLEMENTADO | Text stays local, version/ref optional, local corpus candidate identification, reference confirmation and honest unknown state. No third-party transmission. Broader browser test matrix remains. |
| F8 Grounded AI | BLOQUEADO | Depends on F1 approval. No static fallback is misrepresented as AI. |
| F9 Continuity/offline | IMPLEMENTADO | IndexedDB position/bookmarks/notes, JSON export, validated import with explicit merge/replace, local deletion and verified explicit book caching are implemented. Interrupted-cache and browser migration/restore tests remain before TESTADO. |
| F10 Premium quality/pilot | NÃO INICIADO | CI is green, but real mobile/desktop devices, accessibility tooling, 50-case battery, performance measurements and human pilot remain required. |
| F11 Publication/operation | BLOQUEADO | Source has Firebase Hosting config, but this session still lacks authenticated Firebase project-management and authoritative DNS write access. No project/domain/HTTPS is claimed. |
| F12 Expansion | NÃO INICIADO | Post-core only. |

## Automated evidence
The full-reader commit `b9c9f99e26414dd2862c6fa16c9219ff8908951d` passed NestLume CI run **36698477742**. Earlier corpus, parser, offline-package and IndexedDB commits also passed CI. CI executes TypeScript checks, tests, full corpus integrity/count verification, production build and secret-like file rejection.

## Known validation limitation
A separate local browser smoke could not be run from the current container because its network cannot resolve GitHub to clone the repository. This is **not** counted as a browser pass. GitHub Actions is real CI evidence; real browser/device evidence remains an explicit F10 gate.

## Publication truth
- No Firebase project/site has been created or changed by this execution.
- No DNS record has been created or changed.
- No `production` release is claimed.
- `nestlume.millionsnest.com` is not claimed operational until deployment, DNS, certificate and public smoke tests are evidenced.
