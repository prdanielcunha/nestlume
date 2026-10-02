# NestLume 1.0.0-rc.4 — release candidate

Date: 2026-10-01

## Purpose
RC4 addresses the production feedback that the app felt like “João 1 + a Bible” and that the AI path was not obvious/reliable enough on mobile. The release makes the experience Bible-wide at first contact, brings contextual layers together inside the reader, strengthens João 1, broadens ready editorial starters, and makes grounded AI visibly usable.

## Included
- complete 66-book Bíblia Livre reader/search/reference engine with deterministic integrity checks;
- a Bible-wide home experience instead of defaulting new users to João 1;
- 20 Scripture-grounded starter studies across multiple genres and both testaments;
- a substantially deeper eight-part João 1:1–18 editorial study;
- an inline integrated-study hub on every passage with live textual observations, original-language signals, people, places and related-passages previews;
- deeper Explore panels for context, reading lenses, original languages, people, places, connections and provenance;
- integrated AI evidence built automatically from Scripture, surrounding context, pinned original-language data, people, places, connections and matching editorial claims when available;
- explicit whole-chapter evidence chunking instead of silently studying only the first ~10 verses;
- visible Turnstile verification and submit gating so the user knows when AI is ready;
- 60-second client timeout with clearer anti-abuse/quota/provider failure messages;
- server-side Cloudflare Workers AI origin restriction, Turnstile validation, public rate limiting, evidence-only prompting and claim→evidence validation;
- local notebook, backup/restore, deletion, reading continuation and verified offline books;
- live production AI battery plus 50-case automated Bible/reference quality matrix;
- Firebase Hosting publication with default/custom-domain smoke.

## Deliberately unavailable rather than faked
- protected Bible translations without applicable rights;
- a human-review seal without a named real reviewer;
- textual-variant claims without a suitable pinned evidence source;
- a claim of real-device/human pilot without actual participants/devices.

## Promotion rule
`production` may point to RC4 only after the exact `main` SHA passes the full CI gate. The production workflow then re-verifies the SHA, publishes the protected Worker, executes the real AI battery, removes the temporary validation credential, builds the configured PWA, deploys Firebase Hosting and probes the official domain.

Any critical AI-battery failure blocks publication of that candidate.
