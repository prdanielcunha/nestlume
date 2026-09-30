# F0 — Product contract and rights inventory

Status: **EM ANDAMENTO**  
Evidence date: 2026-09-30

## Budget and product boundary
- Additional authorized operating cost: **R$ 0**.
- No billing activation, Blaze migration, paid API, trial requiring future payment or overage-capable resource is authorized.
- Public Bible reading and local study state do not require login.
- Hub/organization integration is deferred; it is not needed for the public-reading core.

## Scripture corpus — imported and integrity-gated
### Exact corpus used by NestLume
- Work: **Bíblia Livre (BLIVRE)**
- Upstream repository: `blivre/BibliaLivre`
- Pinned release: **2018.2.0**, published 25/02/2018
- Imported source directory: `textos/f4/tr`
- Textual tradition label in that release: **Textus Receptus**
- Copyright stated by the project: © Diego Santos, Mario Sérgio e Marco Teles
- License attached to this exact pinned release: **Creative Commons Atribuição 3.0 Brasil**
- NestLume path: `public/corpus/blivre/2018.2.0/tr/`
- Imported book files: **66**
- Verified chapter count: **1,189**
- Verified verse-record count for this pinned corpus: **31,102**
- Import date: 2026-09-30
- Integrity manifest: `public/corpus/blivre/2018.2.0/manifest.json`
- Upstream license preserved verbatim: `public/corpus/blivre/2018.2.0/LICENCA_UPSTREAM.md`
- Upstream README preserved: `public/corpus/blivre/2018.2.0/README_UPSTREAM.md`

Each raw source file is preserved byte-for-byte as imported from the pinned release and recorded with its upstream Git object hash (`git-blob-sha1`). `scripts/build-corpus.mjs` recomputes that Git object hash from the local bytes before generating any runtime catalog/index. A mismatch fails the build.

The generated reader data does not invent Bible verses: it parses the release's own `\v Book.chapter.verse` records and removes formatting/footnote control markup for display. Added-word markup preserves the underlying words.

### Current eBible distribution is a separate provenance record
The current eBible `porbr2018` distribution identifies Bíblia Livre 2018 and states CC BY 4.0. The historical authors' GitHub release used for NestLume states CC BY 3.0 Brasil and contains several textual output traditions. NestLume therefore does **not** claim that the two distributions are byte-identical or interchange their licenses. The actual bundled corpus is governed and attributed according to the exact pinned source above.

## Protected translations
NAA, NVI, NVT and other protected editions are not bundled. Availability in an API, site, app or repository is not treated as distribution authorization.

Pasted text may carry a user-supplied version label. It remains private/local by default and is not used to reconstruct a shared protected corpus.

## Original-language, lexical and person data
**STEPBible Data** is now integrated through deterministic derived packages, pinned to commit `b99716b0cddb648ddb95cc786a197180f2f97d48`. The repository states CC BY 4.0 and requires STEP Bible attribution.

- TAGNT/TAHOT provide tagged original-language occurrence data.
- TBESG/TBESH provide brief lexical data.
- Exact source hashes/sizes and transformations are recorded in `F0_STEPBIBLE_INVENTORY.md` and `src/editorial/lexical/step-source-manifest.json`.
- TIPNR person identity/reference/relationship data is pinned to Git blob `6fd63c7a5fe651a412f6bfd7dd22398e07d95001` (7,967,205 bytes).
- TIPNR AI-generated descriptive prose fields are intentionally discarded before the generated person packages are written.
- Original-language UI remains occurrence-specific and exposes alignment/versification limitations rather than claiming unsupported precision.

## Typography
The current implementation uses operating-system font stacks only. No font files or font CDN are bundled.

## Connections and geography
OpenBible-derived connection and geography datasets are integrated as reproducible derived packages with pinned source commits and Git blob hashes. They are used only for cross-reference exploration and biblical-place proposals; source relevance/scores remain visible and are not converted into theological certainty.

No external image files or rendered map tiles are bundled.

## Software
Runtime dependencies are pinned in `package.json`/`package-lock.json`. CI runs TypeScript checks, tests, corpus/data integrity, dependency-license allowlist enforcement, production build and desktop/mobile browser smoke tests.

## Editorial reviewers
No human editorial reviewer is invented. The João 1 study is explicitly labeled **rascunho editorial** in-product. Assigning and recording a real reviewer remains necessary before F5 can satisfy its review criterion.

## F0 exit status
The current software/data distribution inventory is implemented and automatically verified for the Bible corpus, STEPBible original-language/person datasets, OpenBible connections/geography and dependency licenses. F0 remains **EM ANDAMENTO** only for future datasets/media not yet introduced and because no real human editorial reviewer has been assigned; no study is falsely marked reviewed.
