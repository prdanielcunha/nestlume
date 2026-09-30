# NestLume 1.0.0-rc.1 — release candidate

Date: 2026-09-30

## Purpose
This release candidate is the first code-complete Bible-wide core suitable for promotion to the `production` branch **after the exact SHA passes the full CI gate**.

It is not automatically equivalent to a public Firebase release. Hosting publication, Cloudflare live AI and human editorial/pilot gates remain separately evidenced.

## Included
- complete 66-book Bíblia Livre reader/search/reference engine;
- Bible-wide contextual Explore flow;
- Greek/Hebrew/Aramaic derived packages from pinned STEPBible sources;
- sourced people, places and Bible connections;
- local notebook, backup/restore and reading continuation;
- verified explicit book-offline caching;
- private paste and local identification;
- grounded AI user flow, provider-neutral protocol and server adapter;
- explicit AI/pasted-text consent;
- Turnstile-before-inference anti-abuse gate;
- claim-to-evidence output validation;
- PT/EN/ES UI foundation;
- light/dark/system, reduced-motion and responsive layout;
- reader contextual panel with focus trap, Escape and Back semantics;
- deterministic rights/data/dependency checks.

## Deliberately unavailable rather than faked
- live AI when no approved provider endpoint is connected;
- protected Bible translations without applicable rights;
- human-review seal without a named human reviewer;
- exact lexical alignment when the exact canonical reference is absent;
- Firebase/domain publication without authenticated infrastructure evidence.

## Promotion rule
`production` may point to this release candidate only after:
1. the target `main` SHA completes NestLume CI successfully;
2. no newer unverified code is included;
3. promotion is fast-forward/non-force;
4. the `production` CI for that same code also succeeds.

## Public-release rule
A synchronized `production` branch is **approved code**, not proof of a live site. `PUBLICADO` additionally requires the nine infrastructure evidences in `RELEASE_CONTRACT.md`.
