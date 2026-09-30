# NestLume

NestLume is a premium, local-first Bible reading and study PWA designed to help people read the whole Bible carefully, explore context and original languages, and verify where explanations come from.

## Release candidate

Current source version: **1.0.0-rc.1**.

The release candidate is Bible-wide in architecture and user flow. João 1 is an initial editorial fixture, not a product boundary.

### Implemented core
- Complete 66-book Bíblia Livre corpus with deterministic integrity/count checks.
- Canonical reference parser, chapter/range reading and full-corpus word search.
- PT/EN/ES interface foundation, light/dark/system themes and reduced-motion support.
- Local-first notebook with reading position, bookmarks, notes, JSON backup/restore and personal-data deletion.
- Explicit verified offline-book packages, including source-hash validation and original-language packages.
- Contextual **Explorar** panel for passage context, original languages, people, places, Bible-wide connections and source provenance.
- Bible-wide Greek/Hebrew/Aramaic source pipeline from pinned STEPBible datasets, with verse-level alignment boundaries surfaced honestly.
- Sourced person/place/cross-reference packages with upstream AI prose excluded from editorial claims.
- Private pasted-text flow with local identification; AI transmission requires separate explicit consent and never puts private text in the URL.
- Provider-neutral grounded-AI contract with evidence IDs, output validation, timeout/quota handling and fail-closed behavior.
- Cloudflare Workers AI candidate adapter protected by server-side Turnstile validation before inference quota is spent.
- Responsive desktop/mobile Chromium smoke tests, performance budget checks, offline smoke and contextual-panel keyboard/history tests.

## AI status

Live AI is **not enabled in production yet**. Cloudflare Workers AI is the current zero-additional-cost F1 candidate. The source adapter, consent flow, anti-abuse gate and 20-case Portuguese evaluation harness exist, but a real authorized Cloudflare account/binding and real model execution are still required before the feature is called tested.

The provider contract is intentionally swappable. A future OpenAI API adapter can be added without redesigning the reading experience. A ChatGPT consumer subscription is never treated as API credit or automated as a backend.

## Scripture and source rights

The integrated initial corpus is the pinned Bíblia Livre 2018.2.0/TR release. Its exact source files, Git object identities and attribution are recorded and checked by the build. Additional translations are not bundled merely because they exist online.

Original-language/person data uses a pinned STEPBible-Data snapshot under its published CC BY 4.0 terms. Connections and geography use pinned source snapshots recorded in `docs/SOURCES.md` and the rights inventory.

## Development

```bash
npm ci
npm run check
npm run build
npm run e2e
npm run dev
```

The CI gate also validates dependency licenses, generated data integrity, AI Worker syntax, the F1 battery harness and absence of secret-like committed files.

## Hosting target

Target production hosting is **Firebase Hosting in an isolated Spark/no-billing project**, with custom domain:

`https://nestlume.millionsnest.com`

Source intentionally contains no Firebase project binding until authenticated infrastructure access verifies the exact project/site and billing state. No Firebase deployment, DNS change or HTTPS status is claimed from source code alone.

## Branch contract

- `main`: development/integration/homologation.
- `production`: exact approved release code, advanced only by fast-forward from a full-CI-passing `main` SHA.
- Branch synchronization means the code is synchronized; it does **not** by itself prove Firebase/DNS publication.

See:
- `docs/ROADMAP_STATUS.md`
- `docs/RELEASE_CONTRACT.md`
- `docs/INFRASTRUCTURE.md`
- `docs/SOURCES.md`
- `docs/WHOLE_BIBLE_SCOPE.md`
