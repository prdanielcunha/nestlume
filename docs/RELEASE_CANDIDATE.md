# NestLume 1.0.0-rc.3 — release candidate

Date: 2026-10-01

## Purpose
RC3 is the hardened Bible-wide production candidate. It preserves the local-first reader while enabling grounded AI through the protected Cloudflare Worker and making the AI release gate semantic as well as structural.

## Included
- complete 66-book Bíblia Livre reader/search/reference engine with deterministic integrity checks;
- Bible-wide contextual Explore flow;
- Greek/Hebrew derived packages from pinned STEPBible sources;
- sourced people, places and Bible connections;
- local notebook, backup/restore, deletion and reading continuation;
- explicit verified offline-book caching;
- private paste and local identification;
- live grounded AI through Cloudflare Workers AI;
- explicit AI/pasted-text consent and server-side Turnstile;
- public inference rate limiting plus free-quota/provider fail-closed behavior;
- strict evidence-only generation instructions and claim→evidence validation;
- live production battery with semantic guards and pinned Greek/Hebrew cases;
- 50-case automated Bible/reference quality matrix;
- PT/EN/ES UI foundation, themes, reduced motion and responsive layouts;
- desktop/mobile browser smoke, offline smoke and performance checks;
- Firebase Hosting publication with default/custom-domain smoke.

## Deliberately unavailable rather than faked
- protected Bible translations without applicable rights;
- a human-review seal without a named real reviewer;
- textual-variant claims without a suitable pinned evidence source;
- a claim of real-device/human pilot without actual participants/devices.

## Promotion rule
`production` may point to RC3 only after the exact `main` SHA passes the full CI gate. The production workflow then performs a second verification, publishes the protected Worker, executes the real AI battery, removes the temporary validation credential, builds the configured PWA, deploys Firebase Hosting and probes the official domain.

Any critical AI-battery failure blocks publication of that candidate.
