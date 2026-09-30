# NestLume source registry

Evidence date: 2026-09-30

## Scripture actually bundled
- Bíblia Livre upstream authors' repository: https://github.com/blivre/BibliaLivre
- Exact pinned release: https://github.com/blivre/BibliaLivre/releases/tag/2018.2.0
- Imported directory: `textos/f4/tr`
- Exact release license preserved at `public/corpus/blivre/2018.2.0/LICENCA_UPSTREAM.md`
- Per-file source hashes: `public/corpus/blivre/2018.2.0/manifest.json`
- Current eBible distribution (separate provenance record): https://ebible.org/porbr2018/

## Original-language and person data actually integrated
- STEPBible Data: https://github.com/STEPBible/STEPBible-Data
- Pinned commit: `b99716b0cddb648ddb95cc786a197180f2f97d48`
- Repository license declaration: CC BY 4.0; attribution to STEP Bible.
- TAGNT/TAHOT + TBESG/TBESH are used by the deterministic original-language build pipeline. Every source file is pinned by Git blob SHA and byte size in `src/editorial/lexical/step-source-manifest.json`.
- TIPNR is pinned at Git blob `6fd63c7a5fe651a412f6bfd7dd22398e07d95001`, 7,967,205 bytes, for person identity/reference/relationship fields.
- TIPNR `@Brief`, `@Short` and `@Article` AI-generated prose is deliberately discarded by `scripts/build-people.mjs`; NestLume does not present it as human-reviewed editorial content.

## Bible-wide connections
- Canonical project/source: OpenBible.info cross references.
- Reproducible source mirror used by the build: `kbennett2000/concord`
- Pinned mirror commit: `698667637c942e89422125501dba8c1a0be37b65`
- Pinned source Git blob: `301fed486c8842c60dc95e930ec4d4c7bee0e101`
- Build: `scripts/build-connections.mjs`
- The UI describes these as investigation links, not automatic proof of an interpretation.

## Biblical geography
- Source repository: https://github.com/openbibleinfo/Bible-Geocoding-Data
- Pinned commit: `7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f`
- Pinned `data/ancient.jsonl` Git blob: `b127b4446c6f4ba36ec62dde290c752afeb51bf3`
- Build: `scripts/build-places.mjs`
- Modern-location associations preserve source scores and are shown as proposals rather than invented certainty.

## Infrastructure / AI policy evidence
- Firebase pricing: https://firebase.google.com/pricing
- Firebase Hosting usage/pricing: https://firebase.google.com/docs/hosting/usage-quotas-pricing
- Gemini API terms: https://ai.google.dev/gemini-api/terms

## Project editorial sources
The master study guide and author-reference document define editorial method and author roles. They do not grant rights to reproduce the listed authors' books. A published claim may cite an author only when the actual source passage was consulted and use is permitted.
