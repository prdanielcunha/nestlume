# NestLume

NestLume is a premium, local-first Bible reading and study PWA designed to help people read the whole Bible carefully, explore context and original languages, and verify where explanations come from.

## Release candidate

Current source version: **1.0.0-rc.4**.

The release candidate is Bible-wide in architecture and user flow. The editorial starter library now contains 20 Scripture-grounded encounters across multiple genres and both testaments; they remain explicitly marked as drafts until real human review is recorded.

### Implemented core
- Complete 66-book Bíblia Livre corpus with deterministic integrity/count checks.
- Canonical reference parser, chapter/range reading and full-corpus word search.
- PT/EN/ES interface foundation, light/dark/system themes and reduced-motion support.
- Local-first notebook with reading position, bookmarks, notes, JSON backup/restore and personal-data deletion.
- Explicit verified offline-book packages, including source-hash validation and original-language packages.
- An inline integrated-study hub on every passage, combining textual observations, original-language availability, people, places, Bible-wide connections and one-click grounded AI; the deeper **Explorar** panels remain available for inspection.
- Bible-wide Greek/Hebrew/Aramaic source pipeline from pinned STEPBible datasets, with verse-level alignment boundaries surfaced honestly.
- Sourced person/place/cross-reference packages with upstream AI prose excluded from editorial claims.
- Private pasted-text flow with local identification; AI transmission requires separate explicit consent and never puts private text in the URL.
- Provider-neutral grounded-AI contract with evidence IDs, output validation, timeout/quota handling and fail-closed behavior.
- Live Cloudflare Workers AI protected by visible server-validated Turnstile, public rate limiting, strict evidence-only output validation and a 60-second mobile-friendly client timeout.
- Responsive desktop/mobile Chromium smoke tests, performance budget checks, offline smoke and contextual-panel keyboard/history tests.

## AI status

Live grounded AI is enabled in production through Cloudflare Workers AI. The browser never receives provider credentials: requests go to the `nestlume-ai` Worker, are restricted to the official NestLume origin, require explicit processing consent and a valid Cloudflare Turnstile challenge, and are rate-limited before inference.

The server accepts only an explicit evidence bundle. Generated claims must reference evidence IDs supplied with that request; output that violates the contract fails closed. The production release gate runs a real Portuguese battery against the same Worker before Firebase Hosting is published. Greek/Hebrew battery cases use pinned STEPBible-derived evidence; unsupported textual-variant analysis remains unavailable rather than being invented.

The provider contract remains swappable. Cloudflare Workers AI is the current zero-additional-cost implementation; free-quota exhaustion and protection limits return an unavailable state while Bible reading, offline content and the local notebook continue working.
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

Production deploys use the isolated Firebase Hosting site `nestlume-555464791734` in project `millionsnest` through Workload Identity Federation. The release workflow verifies the exact SHA, publishes only the NestLume hosting target, checks Firebase's default URL and probes the official custom domain before recording publication evidence.

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
