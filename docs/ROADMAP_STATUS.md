# NestLume — roadmap execution status

Evidence snapshot: 2026-09-30

Status vocabulary: `NÃO INICIADO` · `EM ANDAMENTO` · `IMPLEMENTADO` · `TESTADO` · `PUBLICADO` · `BLOQUEADO`.

| Phase | Status | Evidence / next gate |
|---|---|---|
| F0 Product contract & rights | EM ANDAMENTO | BLIVRE/eBible rights and prototype provenance recorded; full official corpus binary still needs exact import + SHA-256; no human reviewer invented. |
| F1 AI feasibility | BLOQUEADO | Current providers researched; Cloudflare/Qwen technically promising, but teen-use terms need clarification and real 20-case generation test cannot be executed without suitable runtime/account access. Live AI remains disabled. |
| F2 Premium design/prototype | IMPLEMENTADO | Clickable responsive code prototype includes Today, passage entry, paste flow, study, person/original/source/thread contextual panels, notebook and honest unavailable states; light/dark/system, reduced motion and PT/EN/ES interface foundations. Must still undergo real-device/user validation before TESTADO. |
| F3 App foundation | IMPLEMENTADO | React/TS/Vite, strict type config, CI definition, routes, themes, PWA shell, Firebase Hosting config, no runtime secrets. Awaiting remote CI to become TESTADO. |
| F4 Bible/reference engine | EM ANDAMENTO | João 1:1–18 from current eBible page + parser tests. Full 66-book corpus not yet imported, hashed or integrity-tested. |
| F5 Initial editorial library | NÃO INICIADO | Requires 8–12 actually reviewed studies; prototype has one clearly identified draft slice, not claimed as reviewed library. |
| F6 Threads/entities/originals | EM ANDAMENTO | UX contract/prototype exists; authoritative linked datasets not yet imported. |
| F7 Paste text | IMPLEMENTADO | Private local prototype, optional version/ref, honest unknown state, no third-party transmission. Needs broader cases before TESTADO. |
| F8 Grounded AI | BLOQUEADO | Depends on F1 approval. |
| F9 Continuity/offline | EM ANDAMENTO | PWA shell cache and continuity UX prototype exist; IndexedDB, atomic book packages, backup/import not implemented. |
| F10 Premium quality/pilot | NÃO INICIADO | Needs real mobile/desktop devices, accessibility tooling, 50-case battery and human pilot. |
| F11 Publication/operation | BLOQUEADO | No Firebase/DNS connector/credentials available yet; isolated Spark project/site not provisioned; custom domain and HTTPS not verified. |
| F12 Expansion | NÃO INICIADO | Post-core. |

## First safe batch definition
The roadmap recommends F0 + F1 proof + F2 before full feature investment. This repository additionally carries the minimal F3 application foundation necessary to make F2 a real clickable prototype instead of screenshots.

## Non-claims
- A passing build is not production validation.
- The app is not “AI complete”.
- The Bible is not yet fully imported.
- iPhone/Android real-device behavior is not claimed.
- `nestlume.millionsnest.com` is not claimed until DNS + certificate + smoke tests prove it.
